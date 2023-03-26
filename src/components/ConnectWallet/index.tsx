import { useContext } from 'react';
import styles from './index.module.css';
import { WalletContext } from '../../context/WalletContext';

export const ConnectWallet = () => {
  const { wallet } = useContext(WalletContext);

  return (
    <div className={styles.container}>
      <div>
        <title>Argent x StarkNet test dapp</title>
        <link rel='icon' href='/favicon.ico' />
      </div>

      <main className={styles.main}>
        {wallet?.isConnected ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{wallet?.account?.address}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Name: <code>{wallet?.name}</code>
            </h3>
          </>
        ) : (
          <>Welcome, connect your wallet to move on!</>
        )}
      </main>
    </div>
  );
};
