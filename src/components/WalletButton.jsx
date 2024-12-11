import React from "react";
import { useWallet } from "../hooks/useWallet";

export const WalletButton = () => {
  const {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    walletType,
    currentChain,
    switchChain,
    availableChains,
  } = useWallet();

  if (isConnected) {
    return (
      <div className="connect-wallet header-background">
        <span className="font-header">
          {account.slice(0, 6)}...{account.slice(-4)} ({walletType})
        </span>
        {walletType === "MetaMask" && (
          <select
            className=""
            value={currentChain}
            onChange={(e) => switchChain(e.target.value)}
          >
            {Object.entries(availableChains).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        )}
        <button
          className="gradient-button font-header flow-container "
          onClick={disconnectWallet}
        >
          Disconnect
        </button>

      </div>
    );
  }

  return (
    <div className="connect-wallet header-background">
      <button
        className="gradient-button font-header flow-container"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    </div>
  );
};
