import { useState, useCallback, useEffect } from 'react';

export const useMetaMask = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount('');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [handleAccountsChanged]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      handleAccountsChanged(accounts);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }, [handleAccountsChanged]);

  const disconnectWallet = useCallback(() => {
    setAccount('');
    setIsConnected(false);
  }, []);

  return { account, isConnected, connectWallet, disconnectWallet };
};