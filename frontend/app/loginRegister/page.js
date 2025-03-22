"use client"

import React, { useState, useContext, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EcoConnectContext } from '../../context/EcoConnect';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Register = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'regular' // 'regular' or 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Here you would typically make an API call to your backend
      // to store user credentials and type
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setSuccess(true);
      // Store user type in localStorage for later use
      localStorage.setItem('userType', formData.userType);
      
      setTimeout(() => {
        const userType = localStorage.getItem('userType');
        router.push(userType === 'agent' ? '/agentDashboard' : '/userDashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Register Account</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertDescription>
                  Registration successful!  
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  User Type
                </label>
                <Select name="userType" value={formData.userType} onValueChange={(value) => handleChange({ target: { name: 'userType', value }})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular User</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Login = () => {
  const { connectWallet, currentAccount, contract } = useContext(EcoConnectContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already connected and registered
  useEffect(() => {
    const checkUserStatus = async () => {
      if (contract && currentAccount) {
        try {
          const userType = localStorage.getItem('userType');
          const userDetails = await contract.getUserDetails(currentAccount);
          
          if (userDetails.isRegistered) {
            router.push(userType === 'agent' ? '/agentDashboard' : '/userDashboard');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }
    };

    checkUserStatus();
  }, [currentAccount, contract, router]);

  const handleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      // First ensure wallet is connected
      await connectWallet();
      
      if (!contract || !currentAccount) {
        throw new Error('Wallet connection failed');
      }

      const userType = localStorage.getItem('userType');
      if (!userType) {
        throw new Error('Please select your user type first');
      }

      // Check if user is registered
      const userDetails = await contract.getUserDetails(currentAccount);
      
      if (userDetails.isRegistered) {
        // If registered, redirect to appropriate dashboard
        router.push(userType === 'agent' ? '/agentDashboard' : '/userDashboard');
      } else {
        // If not registered, register the user
        const tx = userType === 'agent' 
          ? await contract.registerAgent()
          : await contract.registerUser();
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // After successful registration, redirect
        router.push(userType === 'agent' ? '/agentDashboard' : '/userDashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-gray-600 mb-6 text-center">
              Connect your wallet to complete the registration process and access your account.
            </p>

            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AuthPages() {
  const [currentPage, setCurrentPage] = useState('register');
  const router = useRouter();

  useEffect(() => {
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setCurrentPage(tab);
    }
  }, []);

  return (
    <div>
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => {
            setCurrentPage('register');
            router.push('/loginRegister?tab=register');
          }}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'register'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => {
            setCurrentPage('login');
            router.push('/loginRegister?tab=login');
          }}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'login'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Login
        </button>
      </div>
      {currentPage === 'login' ? <Login /> : <Register />}
    </div>
  );
}

