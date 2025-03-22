'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AgentDashboard() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingCollections, setPendingCollections] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [stats, setStats] = useState({
    totalVerified: 25,
    totalWasteCollected: 45,
    totalPointsAwarded: 400,
  });

  const POINT_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_POINT_SYSTEM_ADDRESS;
  const WASTE_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_WASTE_COLLECTION_ADDRESS;
  const DEFAULT_AGENT_ADDRESS = '0x009188c8eeC3d184735650CdeaF4A145C5FdfB44';

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        await checkAgentStatus(accounts[0]);
        setIsAgent(accounts[0].toLowerCase() === DEFAULT_AGENT_ADDRESS.toLowerCase());
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
        setStatusMessage("Error connecting to wallet. Please try again.");
      }
    } else {
      setStatusMessage("Please install MetaMask to use this application.");
    }
    setIsLoading(false);
  }

  async function checkAgentStatus(accountAddress) {
    if (!accountAddress || !POINT_SYSTEM_ADDRESS) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        POINT_SYSTEM_ADDRESS,
        pointSystemABI,
        provider
      );

      const agentStatus = await contract.isAgent(accountAddress);
      setIsAgent(agentStatus || accountAddress.toLowerCase() === DEFAULT_AGENT_ADDRESS.toLowerCase());

      if (agentStatus || accountAddress.toLowerCase() === DEFAULT_AGENT_ADDRESS.toLowerCase()) {
        await loadAgentData();
      } else {
        setStatusMessage("You are not registered as an agent. Please register first.");
      }
    } catch (error) {
      console.error("Error checking agent status:", error);
      setStatusMessage("Error checking agent status. Please try again.");
    }
  }

  async function loadAgentData() {
    if (!isConnected || !WASTE_COLLECTION_ADDRESS) return;

    try {
      setIsLoading(true);
      await loadPendingCollections();
      await loadRecentVerifications();
      await loadAgentStats();
    } catch (error) {
      console.error("Error loading agent data:", error);
      setStatusMessage("Error loading data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPendingCollections() {
    const mockPendingCollections = [
      {
        qrCode: ethers.utils.formatBytes32String("qr123456"),
        user: "0x1234567890123456789012345678901234567890",
        wasteType: 1,
        weight: 5,
        timestamp: new Date(Date.now() - 86400000).toLocaleString() // 1 day ago
      },
      {
        qrCode: ethers.utils.formatBytes32String("qr789012"),
        user: "0x0987654321098765432109876543210987654321",
        wasteType: 2,
        weight: 3,
        timestamp: new Date(Date.now() - 43200000).toLocaleString() // 12 hours ago
      }
    ];

    setPendingCollections(mockPendingCollections);
  }

  async function loadRecentVerifications() {
    const mockVerifications = [
      {
        qrCode: ethers.utils.formatBytes32String("qr555555"),
        user: "0x5555555555555555555555555555555555555555",
        wasteType: 1,
        weight: 7,
        pointsAwarded: 70,
        timestamp: new Date(Date.now() - 3600000).toLocaleString() // 1 hour ago
      },
      {
        qrCode: ethers.utils.formatBytes32String("qr666666"),
        user: "0x6666666666666666666666666666666666666666",
        wasteType: 3,
        weight: 2,
        pointsAwarded: 10,
        timestamp: new Date(Date.now() - 7200000).toLocaleString() // 2 hours ago
      },
      {
        qrCode: ethers.utils.formatBytes32String("qr777777"),
        user: "0x7777777777777777777777777777777777777777",
        wasteType: 2,
        weight: 4,
        pointsAwarded: 60,
        timestamp: new Date(Date.now() - 14400000).toLocaleString() // 4 hours ago
      }
    ];

    setRecentVerifications(mockVerifications);
  }

  async function loadAgentStats() {
    const mockStats = {
      totalVerified: 57,
      totalWasteCollected: 248,
      totalPointsAwarded: 2980
    };

    setStats(mockStats);
  }

  async function verifyCollection(qrCode) {
    if (!isConnected || !WASTE_COLLECTION_ADDRESS || !isAgent) return;

    setIsLoading(true);
    setStatusMessage('');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        WASTE_COLLECTION_ADDRESS,
        wasteCollectionABI,
        signer
      );

      const tx = await contract.verifyCollection(qrCode);
      setStatusMessage("Verification submitted. Waiting for transaction...");

      await tx.wait();
      setStatusMessage("Successfully verified waste collection.");

      await loadAgentData();
    } catch (error) {
      console.error("Error verifying collection:", error);
      setStatusMessage("Error verifying collection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    connectWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkAgentStatus(accounts[0]);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-green-700">Agent Dashboard</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <p className="mb-4">Connect your wallet to access your agent dashboard.</p>
          <button
            onClick={connectWallet}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Connect Wallet
          </button>

          {statusMessage && (
            <div className="p-4 bg-red-100 text-red-800 rounded-md mt-4">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAgent) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-green-700">Agent Dashboard</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
            You are not registered as an approved agent. Only approved agents can access the dashboard.
          </div>
          <Link href="/agent-registration" className="text-green-600 hover:text-green-700 underline">
            Go to Agent Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
        &larr; Back to Home
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Agent Dashboard</h1>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Connected as:</span> {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'None'}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Verifications</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalVerified}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Waste Collected (kg)</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalWasteCollected}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Points Awarded</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalPointsAwarded}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/waste-verification" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Verify New Collection
              </Link>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>

          {/* Pending Collections */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Pending Collections</h2>

            {pendingCollections.length === 0 ? (
              <p className="text-gray-600">No pending collections to verify.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Waste Type</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Weight (kg)</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingCollections.map((collection, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4">{`${collection.user.substring(0, 6)}...${collection.user.substring(collection.user.length - 4)}`}</td>
                        <td className="py-2 px-4">
                          {collection.wasteType === 1 ? 'Plastic' :
                            collection.wasteType === 2 ? 'Metal' :
                              collection.wasteType === 3 ? 'Paper' : 'Other'}
                        </td>
                        <td className="py-2 px-4">{collection.weight}</td>
                        <td className="py-2 px-4">{collection.timestamp}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => verifyCollection(collection.qrCode)}
                            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Verifications */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Recent Verifications</h2>

            {recentVerifications.length === 0 ? (
              <p className="text-gray-600">No recent verifications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Waste Type</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Weight (kg)</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Points</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentVerifications.map((verification, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4">{`${verification.user.substring(0, 6)}...${verification.user.substring(verification.user.length - 4)}`}</td>
                        <td className="py-2 px-4">
                          {verification.wasteType === 1 ? 'Plastic' :
                            verification.wasteType === 2 ? 'Metal' :
                              verification.wasteType === 3 ? 'Paper' : 'Other'}
                        </td>
                        <td className="py-2 px-4">{verification.weight}</td>
                        <td className="py-2 px-4">{verification.points}</td>
                        <td className="py-2 px-4">{verification.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-md mt-8 ${statusMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              {statusMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
}