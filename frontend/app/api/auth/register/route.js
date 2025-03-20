import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, email, password, userType } = await request.json();

    // Validation
    if (!username || !email || !password || !userType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, create auth user in Supabase
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: userType
        }
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { message: 'Failed to create authentication user' },
        { status: 500 }
      );
    }

    // Then create user in our users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id, // Use the auth user's ID
          username,
          email,
          password: hashedPassword,
          user_type: userType,
          wallet_address: null
        }
      ])
      .select()
      .single();

    if (insertError) {
      // If user table insertion fails, clean up auth user
      console.error('Database insertion error:', insertError);
      
      // Attempt to delete the auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        authUser.user.id
      );

      if (deleteError) {
        console.error('Failed to cleanup auth user:', deleteError);
      }

      return NextResponse.json(
        { 
          message: 'Failed to create user in database',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        userType,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          userType: newUser.user_type
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}



