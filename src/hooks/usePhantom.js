import { useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export const usePhantom = () => {
  const [publicKey, setPublicKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const getProvider = () => {
    if ('solana' in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  const handleAccountChange = useCallback((publicKey) => {
    if (publicKey) {
      setPublicKey(publicKey.toString());
      setIsConnected(true);
    } else {
      setPublicKey('');
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on('connect', handleAccountChange);
      provider.on('disconnect', () => handleAccountChange(null));
      return () => {
        provider.removeAllListeners();
      };
    }
  }, [handleAccountChange]);

  const connectWallet = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      const resp = await provider.connect();
      handleAccountChange(resp.publicKey);
    } catch (error) {
      console.error('Error connecting to Phantom:', error);
    }
  }, [handleAccountChange]);

  const disconnectWallet = useCallback(async () => {
    const provider = getProvider();
    if (provider) {
      await provider.disconnect();
      handleAccountChange(null);
    }
  }, [handleAccountChange]);

  return { publicKey, isConnected, connectWallet, disconnectWallet };
};