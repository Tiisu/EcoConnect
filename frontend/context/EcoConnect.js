'use client';

import React, { useState, createContext, useEffect } from "react";
import { ethers } from "ethers";
import { ECOCONNECT_ADDRESS, ECOCONNECT_ABI } from './Constants';

export const EcoConnectContext = createContext({
  connectWallet: async () => {},
  currentAccount: "",
  loading: false,
  contract: null,
  provider: null,
  signer: null,
});

export const EcoConnectProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            const ecoConnectContract = new ethers.Contract(
              ECOCONNECT_ADDRESS,
              ECOCONNECT_ABI,
              signer
            );
            
            setProvider(web3Provider);
            setSigner(signer);
            setCurrentAccount(accounts[0]);
            setContract(ecoConnectContract);
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this application");
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const userAddress = await signer.getAddress();

      // Initialize contract
      const ecoConnectContract = new ethers.Contract(
        ECOCONNECT_ADDRESS,
        ECOCONNECT_ABI,
        signer
      );

      setProvider(web3Provider);
      setSigner(signer);
      setCurrentAccount(userAddress);
      setContract(ecoConnectContract);

      return userAddress;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await web3Provider.getSigner();
          const ecoConnectContract = new ethers.Contract(
            ECOCONNECT_ADDRESS,
            ECOCONNECT_ABI,
            signer
          );
          
          setProvider(web3Provider);
          setSigner(signer);
          setCurrentAccount(accounts[0]);
          setContract(ecoConnectContract);
        } else {
          setCurrentAccount("");
          setContract(null);
          setSigner(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <EcoConnectContext.Provider
      value={{
        connectWallet,
        currentAccount,
        loading,
        contract,
        provider,
        signer,
      }}
    >
      {children}
    </EcoConnectContext.Provider>
  );
};
