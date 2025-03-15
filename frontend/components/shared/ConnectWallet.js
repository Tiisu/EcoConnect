'use client';

import { useWeb3 } from '@/context/Web3Context';

export default function ConnectWallet() {
  const { account, connectWallet, loading } = useWeb3();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="text-center">
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-gray-600">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}
    </div>
  );
}