import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // First authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user details from our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Create session token
    const token = sign(
      { 
        userId: user.id, 
        userType: user.user_type,
        session: authData.session.access_token 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        userType: user.user_type,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.user_type
        }
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
