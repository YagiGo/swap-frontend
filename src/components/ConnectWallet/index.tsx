import { useEffect, useState } from 'react';
import { walletService } from 'services/wallet.service';
import styles from './index.module.css';
import { StarknetWindowObject } from 'get-starknet-core';

export const ConnectWallet = () => {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>();
  const handleConnect = async () => {
    const wallet = await walletService.connectToWallet({
      modalMode: 'alwaysAsk',
    });
    setWallet(wallet);
  };

  const handleDisconnect = async () => {
    await walletService.disconnectWallet({ clearLastWallet: true });
    setWallet(null);
  };

  const connectedToPreviousWallet = async () => {
    const ret = await walletService.restorePreviouslyConnectedWallet();
    console.log(ret);
    setWallet(ret);
  };

  useEffect(() => {
    connectedToPreviousWallet();
  }, [wallet]);

  return (
    <div className={styles.container}>
      <div>
        <title>Argent x StarkNet test dapp</title>
        <link rel='icon' href='/favicon.ico' />
      </div>

      <main className={styles.main}>
        {walletService.isConnected() ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{wallet?.account?.address}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Name: <code>{wallet?.name}</code>
            </h3>
            <button onClick={async () => await handleDisconnect()}>
              Disconnect
            </button>
          </>
        ) : (
          <>
            <p>First connect wallet to use dApp</p>
            <button onClick={async () => await handleConnect()}>
              Connect Wallet
            </button>
          </>
        )}
      </main>
    </div>
  );
};
