import { useState, useCallback, useEffect } from 'react';

const getPhantomProvider = () => {
  if ('solana' in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
  return null;
};

const CHAINS = {
  ethereum: { chainId: '0x1', name: 'Ethereum' },
  polygon: { chainId: '0x89', name: 'Polygon' },
  bsc: { chainId: '0x38', name: 'BSC' },
};

export const useWallet = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [currentChain, setCurrentChain] = useState('');

  const handleMetaMaskAccount = useCallback((accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount('');
      setWalletType('');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      setWalletType('MetaMask');
      window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
        const chain = Object.entries(CHAINS).find(([, value]) => value.chainId === chainId);
        setCurrentChain(chain ? chain[0] : '');
      });
    }
  }, []);

  const handlePhantomAccount = useCallback((publicKey) => {
    if (publicKey) {
      setAccount(publicKey.toString());
      setIsConnected(true);
      setWalletType('Phantom');
      setCurrentChain('solana');
    } else {
      setAccount('');
      setIsConnected(false);
      setWalletType('');
      setCurrentChain('');
    }
  }, []);

  const switchChain = async (chainName) => {
    if (walletType !== 'MetaMask' || !CHAINS[chainName]) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAINS[chainName].chainId }],
      });
      setCurrentChain(chainName);
    } catch (error) {
      console.error('Error switching chain:', error);
    }
  };

  useEffect(() => {
    const phantomProvider = getPhantomProvider();
    if (phantomProvider) {
      phantomProvider.on('connect', (publicKey) => handlePhantomAccount(publicKey.publicKey));
      phantomProvider.on('disconnect', () => handlePhantomAccount(null));
      return () => {
        phantomProvider.removeAllListeners();
      };
    } else if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleMetaMaskAccount);
      window.ethereum.on('chainChanged', () => {
        window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
          const chain = Object.entries(CHAINS).find(([, value]) => value.chainId === chainId);
          setCurrentChain(chain ? chain[0] : '');
        });
      });
      return () => {
        window.ethereum.removeListener('accountsChanged', handleMetaMaskAccount);
      };
    }
  }, [handleMetaMaskAccount, handlePhantomAccount]);

  const connectWallet = useCallback(async () => {
    const phantomProvider = getPhantomProvider();
    const hasMetaMask = typeof window.ethereum !== 'undefined';

    if (phantomProvider) {
      try {
        const resp = await phantomProvider.connect();
        handlePhantomAccount(resp.publicKey);
        return;
      } catch (error) {
        console.error('Phantom connection error:', error);
        if (hasMetaMask) {
          try {
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            handleMetaMaskAccount(accounts);
            return;
          } catch (metaMaskError) {
            console.error('MetaMask connection error:', metaMaskError);
          }
        }
      }
    } else if (hasMetaMask) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        handleMetaMaskAccount(accounts);
        return;
      } catch (error) {
        console.error('MetaMask connection error:', error);
      }
    }

    if (!phantomProvider && !hasMetaMask) {
      const userChoice = window.confirm(
        'No wallet detected. Would you like to install MetaMask? Click OK for MetaMask, Cancel for Phantom.'
      );
      if (userChoice) {
        window.open('https://metamask.io/download/', '_blank');
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    }
  }, [handleMetaMaskAccount, handlePhantomAccount]);

  const disconnectWallet = useCallback(async () => {
    if (walletType === 'MetaMask') {
      setAccount('');
      setIsConnected(false);
      setWalletType('');
      setCurrentChain('');
    } else if (walletType === 'Phantom') {
      const phantomProvider = getPhantomProvider();
      if (phantomProvider) {
        await phantomProvider.disconnect();
        setAccount('');
        setIsConnected(false);
        setWalletType('');
        setCurrentChain('');
      }
    }
  }, [walletType]);

  return {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    walletType,
    currentChain,
    switchChain,
    availableChains: CHAINS
  };
};