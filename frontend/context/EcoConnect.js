'use client'

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ECOCONNECT_ADDRESS, ECOCONNECT_ABI } from './Constants';

// Helper function to create contract instance
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(ECOCONNECT_ADDRESS, ECOCONNECT_ABI, signerOrProvider);

// Create Context
export const EcoConnectContext = React.createContext();

export const EcoConnectProvider = ({ children }) => {
    // State management
    const [currentAccount, setCurrentAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    // Connect wallet function
    const connectWallet = async () => {
        try {
            // Initialize Web3Modal and get provider
            let signer = null;
            let web3Provider;

            if (window.ethereum == null) {

                console.log("MetaMask not installed; using read-only defaults")
                web3Provider = ethers.getDefaultProvider()

            } else {

                web3Provider = new ethers.BrowserProvider(window.ethereum)
                signer = await web3Provider.getSigner();
            }
            
            
            // Get signer and address
            const userSigner = web3Provider.getSigner();
            const userAddress = await userSigner.address();

            // Update state
            setProvider(web3Provider);
            setSigner(userSigner);
            setCurrentAccount(userAddress);

            // Initialize contract
            const ecoConnectContract = fetchContract(userSigner);
            setContract(ecoConnectContract);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    // Fetch contract data
    const fetchSmartContracts = async () => {
        if (!contract) return;
        try {
            // Fetch basic contract information
            const pointPrice = await contract.pointPrice();
            const minimumRewardPoints = await contract.minimumRewardPoints();
            const minimumAgentPoints = await contract.minimumAgentPoints();
            
            console.log("Fetched data from smart contract:", {
                pointPrice: pointPrice.toString(),
                minimumRewardPoints: minimumRewardPoints.toString(),
                minimumAgentPoints: minimumAgentPoints.toString(),
            });
        } catch (error) {
            console.error("Failed to fetch smart contracts:", error);
        }
    };

    // Handle account changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", () => {
                connectWallet();
            });
        }
    }, []);

    // Fetch contract data when contract is available
    useEffect(() => {
        if (contract) {
            fetchSmartContracts();
        }
    }, [contract]);

    return (
        <EcoConnectContext.Provider 
            value={{ 
                connectWallet, 
                currentAccount, 
                contract,
                provider,
                signer 
            }}
        >
            {children}
        </EcoConnectContext.Provider>
    );
};