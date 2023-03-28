import {ConnectWallet, Quote} from 'components';
import {tradeExactIn} from "../../services/trade.service";
import {tokens} from 'enums/tokens';
import {ChainId, JSBI, TokenAmount} from "10k_swap_sdk";
import { tryParseAmount } from "utils/maths";
import { useContext, useEffect, useState} from "react";
import {Input, Select, Button} from "antd";
import {WalletContext} from "../../context/WalletContext";
import {Abi, Contract, Provider} from "starknet";
import I10kSwapPairABI from "../../abi/l0k_pair_abi.json";
import {defaultProvider} from "../../constants";
import {uint256ToBN} from "starknet/utils/uint256";
import {getBalance} from "../../services/balances.service";
const { Option } = Select;
const Swap = () => {
  const [fromCurrency, setFronCurrency] = useState('ETH')
  const [toCurrency, setToCurrency] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [outAmount, setOutAmount] = useState(0)
  const { wallet } = useContext(WalletContext);
  const [insufficient, setInsufficient] = useState(false);
  const onSwap = async () => {
    const inputToken = tokens[ChainId.MAINNET].filter(item => item.symbol === fromCurrency)[0]
    const outputToken = tokens[ChainId.MAINNET].filter(item => item.symbol === toCurrency)[0]
    tradeExactIn(tryParseAmount(inputValue, inputToken), outputToken).then(ret => {
      const outAmount = ret?.outputAmount.toSignificant(10)
      setOutAmount(Number(outAmount) || 0)
    })
    if(wallet) {
      const inputBalance = await getBalance(wallet, inputToken.address)
      const outputBalance = await getBalance(wallet, outputToken.address)
      console.log(inputBalance, outputBalance)
      if(Number(inputBalance) < Number(inputValue)) {
        setInsufficient(true)
      }
      else setInsufficient(false)
    }
  }
  const swapNumber = () => {
    setInputValue(outAmount.toString())
  }

  useEffect(() => {
    if(wallet) {
      console.log(wallet.provider?.baseUrl)
      const address = wallet.account?.address
      console.log(wallet)
      wallet.provider?.getContractAddresses().then(addr => {
        console.log(addr);
      })

      const contract = new Contract(I10kSwapPairABI as Abi, wallet.account?.address || '' , defaultProvider);
      console.log(contract)
      contract.call('balanceOf', []).then(ret => {
        console.log(ret)
      })
      console.log(address)
    }
    console.log(defaultProvider)
  }, [wallet])

  useEffect(() => {
    onSwap()
  }, [fromCurrency, toCurrency, inputValue])
  const generateBtnText = () => {
    if(!wallet?.isConnected) return 'Connect Wallet'
    if(insufficient) return 'Insufficient Balance'
    return 'Transfer'
  }
  return (
    <>
      <div>
        <Input style={{width: 220}} value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
        <Select value={fromCurrency} onSelect={setFronCurrency}>
          {tokens[ChainId.MAINNET].map(item => (
            <Option key={item.symbol} value={item.symbol}>{item.name}</Option>
          ))}
        </Select>
        <Input value={outAmount} style={{width: 220}} />
        <Select value={toCurrency} onSelect={setToCurrency}>
          {tokens[ChainId.MAINNET].map(item => (
            <Option key={item.symbol} value={item.symbol}>{item.name}</Option>
          ))}
        </Select>
        <Button onClick={swapNumber}>Swap </Button>
      </div>
      <div>
        <Button disabled={!wallet?.isConnected || insufficient}>{
          generateBtnText()
        }</Button>
      </div>

    </>
  );
};

export default Swap;
