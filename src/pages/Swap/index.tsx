import {tradeExactIn} from "../../services/trade.service";
import {tokens} from 'enums/tokens';
import {ChainId} from "10k_swap_sdk";
import { tryParseAmount } from "utils/maths";
import { useContext, useEffect, useState} from "react";
import {Input, Select, Button} from "antd";
import {WalletContext} from "../../context/WalletContext";
import {getBalance} from "../../services/balances.service";
import styles from './index.module.css';

const { Option } = Select;
const Swap = () => {
  const [fromCurrency, setFronCurrency] = useState('ETH')
  const [toCurrency, setToCurrency] = useState('DAI')
  const [inputValue, setInputValue] = useState('')
  const [outAmount, setOutAmount] = useState(0)
  const [balance, setBalance] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const { wallet } = useContext(WalletContext);
  const [insufficient, setInsufficient] = useState(false);
  const onSwap = async () => {
    setIsFetching(true)
    const inputToken = tokens[ChainId.MAINNET].filter(item => item.symbol === fromCurrency)[0]
    const outputToken = tokens[ChainId.MAINNET].filter(item => item.symbol === toCurrency)[0]

    tradeExactIn(tryParseAmount(inputValue, inputToken), outputToken).then(ret => {
      const outAmount = ret?.outputAmount.toSignificant(10)
      setOutAmount(Number(outAmount) || 0)
    })
    if(wallet) {
      const inputBalance = await getBalance(wallet, inputToken.address)
      if(Number(inputBalance) < Number(inputValue)) {
        setInsufficient(true)
      }
      else setInsufficient(false)
    }
    setIsFetching(false);
  }
  const swapNumber = () => {
    setInputValue(outAmount.toString())
    const tmp = fromCurrency;
    setFronCurrency(toCurrency)
    setToCurrency(tmp)
  }

  useEffect(() => {
    if(wallet) {
      getBalance(wallet, tokens[ChainId.MAINNET][0].address).then(ret => {
        setBalance(Number(ret) || 0)
      })
    }
  }, [wallet])

  useEffect(() => {
    onSwap()
  }, [fromCurrency, toCurrency, inputValue])
  const generateBtnText = () => {
    if(!wallet?.isConnected) return 'Connect Wallet'
    if(insufficient) return 'Insufficient Balance'
    if(!inputValue) return 'Input An Amount'
    if(isFetching) return 'Calculating...'
    return 'Transfer'
  }
  return (
    <div className={styles.swapContainer}>
      <div className={styles.fromCurrency}>
        <Input style={{width: 220}} value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
        <div className={styles.fromCurrencySelectContainer}>
          <Select value={fromCurrency} onSelect={setFronCurrency}>
            {tokens[ChainId.MAINNET].map(item => (
              <Option key={item.symbol} value={item.symbol}>{item.name}</Option>
            ))}
          </Select>
          <div className={styles.balanceBox}>
            {
              !wallet ? <span className={styles.balance}>Connect your wallet first</span> : <>
                <span className={styles.balance}>Balance: {balance}</span>
                <span className={styles.maxSwap} onClick={() => {setInputValue(balance.toString())}}>max</span>
              </>
            }
          </div>
        </div>

      </div>
      <Button onClick={swapNumber}>Swap </Button>
      <div className={styles.toCurrency}>
        <Input value={outAmount} style={{width: 220}} />
        <Select value={toCurrency} onSelect={setToCurrency} placeholder={'Select'}>
          {tokens[ChainId.MAINNET].map(item => (
            <Option key={item.symbol} value={item.symbol}>{item.name}</Option>
          ))}
        </Select>
      </div>
      <div>
        <Button onClick={() => alert('Tx Start')} style={{height: 60, width: 300, borderRadius: 300, backgroundColor: '#0070f3', color: 'white', fontSize: '20px'}} disabled={!wallet?.isConnected || insufficient || !inputValue || isFetching}>{
          generateBtnText()
        }</Button>
      </div>

    </div>
  );
};

export default Swap;
