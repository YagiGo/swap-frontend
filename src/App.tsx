//@ts-nocheck
import React, { useReducer, useState } from 'react';
import './App.css';
import { Layout } from 'components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Swap from 'pages/Swap';
import Pool from 'pages/Pool';
import { WalletContext } from 'context/WalletContext';
import { StarknetWindowObject } from 'get-starknet-core';
function App() {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);
  return (
    <Router>
      <WalletContext.Provider
        value={{
          wallet,
          setWallet,
        }}
      >
        <Switch>
          <Layout>
            <Route path='/' exact component={Swap} />
            <Route path='/pool' exact component={Pool} />
          </Layout>
        </Switch>
      </WalletContext.Provider>
    </Router>
  );
}

export default App;
