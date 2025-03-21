"use client"

import React, { useState, useContext } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EcoConnectContext } from '../../context/EcoConnect';
import { useRouter } from 'next/navigation';

const Register = () => {
  const { contract, currentAccount } = useContext(EcoConnectContext);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!currentAccount) throw new Error("Please connect your wallet first");

      // Call the smart contract's registerUser function
      const tx = await contract.registerUser();
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      // Store additional user data (could be done in a separate backend)
      // This is optional since the smart contract doesn't store this info
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4">
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
              <Alert className="mb-4 bg-green-50 text-green-600 border-green-200">
                <AlertDescription>
                  Registration successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !currentAccount}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
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

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await connectWallet();
      
      // Check if user is registered
      if (contract && currentAccount) {
        const userDetails = await contract.getUserDetails(currentAccount);
        
        if (userDetails.isRegistered) {
          router.push('/dashboard');
        } else {
          router.push('/auth?page=register');
        }
      }
      
    } catch (error) {
      setError(error.message || "Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4">
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
              Connect your wallet to access your account. New users will be redirected to registration.
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Connecting...
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AuthPages() {
  const [currentPage, setCurrentPage] = useState('login');
  const { currentAccount } = useContext(EcoConnectContext);

  return (
    <div>
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setCurrentPage('login')}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'login'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentPage('register')}
          disabled={!currentAccount}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'register'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600'
          } ${!currentAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Register
        </button>
      </div>
      {currentPage === 'login' ? <Login /> : <Register />}
    </div>
  );
}

