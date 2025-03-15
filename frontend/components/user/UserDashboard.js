'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';

export default function UserDashboard() {
  const { contract, account } = useWeb3();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract && account) {
      loadUserData();
    }
  }, [contract, account]);

  const loadUserData = async () => {
    try {
      const user = await contract.getUserDetails(account);
      setUserData({
        pointBalance: user.pointBalance.toString(),
        totalWasteReported: user.totalWasteReported.toString(),
        rewardsEarned: user.rewardsEarned.toString()
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Points Balance</h3>
          <p className="text-2xl text-green-600">{userData?.pointBalance}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Waste Reported</h3>
          <p className="text-2xl text-green-600">{userData?.totalWasteReported} kg</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Rewards Earned</h3>
          <p className="text-2xl text-green-600">{userData?.rewardsEarned}</p>
        </div>
      </div>
    </div>
  );
}