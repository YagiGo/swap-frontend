import {ConnectWallet, Quote} from 'components';
import {tradeExactIn} from "../../services/trade.service";
import {tokens} from 'enums/tokens';
import {ChainId, JSBI, TokenAmount} from "10k_swap_sdk";
import { tryParseAmount } from "utils/maths";
import {useEffect} from "react";

const Swap = () => {
  const calculateSwap = async() => {
    if(tokens[ChainId.MAINNET]?.length) {
      const ret = await tradeExactIn(tryParseAmount(1, tokens[ChainId.MAINNET][0]), tokens[ChainId.MAINNET][1])
      if(ret) {
        console.log(ret, ret.executionPrice, ret.inputAmount.token.symbol, ret.inputAmount.toSignificant(10), ret.outputAmount.token.symbol, ret.outputAmount.toSignificant(10))
      }
    }
  }
  useEffect(() => {
    calculateSwap()
  }, [])

  return (
    <>
      <Quote />
    </>
  );
};

export default Swap;
