"use client"
import { useState, useEffect } from 'react';

const walletConnect = () => {
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.aptos) {
      setWalletAvailable(true);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const response = await window.aptos.connect();
      setAddress(response.address);
    } catch (error) {
      console.error('Error connecting to Petra Wallet:', error);
    }
  };

  return { walletAvailable, connectWallet, address };
};

export default walletConnect;
