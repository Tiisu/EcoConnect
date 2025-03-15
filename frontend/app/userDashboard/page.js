"use client"

import React, { useState } from 'react';
import { 
  BarChart, 
  CreditCard, 
  Package, 
  Recycle, 
  History,
  QrCode,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - replace with actual data from your contract
  const userStats = {
    totalPoints: 1250,
    totalCollections: 25,
    pendingVerifications: 2,
    monthlyCollections: [
      { month: 'Jan', amount: 120 },
      { month: 'Feb', amount: 150 },
      { month: 'Mar', amount: 180 },
    ]
  };

  const recentCollections = [
    {
      id: 1,
      date: '2025-02-15',
      wasteType: 'Plastic',
      weight: 2.5,
      points: 25,
      verified: true
    },
    {
      id: 2,
      date: '2025-02-14',
      wasteType: 'Metal',
      weight: 1.8,
      points: 27,
      verified: true
    },
    {
      id: 3,
      date: '2025-02-13',
      wasteType: 'Paper',
      weight: 3.0,
      points: 15,
      verified: false
    }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold">{userStats.totalPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Collections</p>
              <p className="text-2xl font-bold">{userStats.totalCollections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <History className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Verifications</p>
              <p className="text-2xl font-bold">{userStats.pendingVerifications}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Progress</p>
              <p className="text-2xl font-bold">+15%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNewCollection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Register New Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waste Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="1">Plastic</option>
              <option value="2">Metal</option>
              <option value="3">Paper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Scan or enter QR code"
              />
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              >
                <QrCode className="h-5 w-5" />
              </button>
            </div>
          </div> */}

          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Register Collection
          </button>
        </form>
      </CardContent>
    </Card>
  );

  const renderHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCollections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Recycle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{collection.wasteType}</p>
                  <p className="text-sm text-gray-500">{collection.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{collection.weight} kg</p>
                <p className="text-sm text-gray-500">{collection.points} points</p>
              </div>
              <div className="flex items-center">
                {collection.verified ? (
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">
                    Pending
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your waste collection overview.</p>
        </div>

        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'overview'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'new'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              New Collection
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'history'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'new' && renderNewCollection()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default Dashboard;