import {JSBI, Pair, Token, TokenAmount, Trade} from "10k_swap_sdk";
import I10kSwapPairABI from 'abi/l0k_pair_abi.json';
import {Contract, Abi} from "starknet";
import {defaultProvider} from "../constants";
import {tryParseAmount} from "../utils/maths";
export const allCommonPairs = (currencyA: Token, currencyB: Token) => {
  const tokens = [[currencyA, currencyB]]
  const pairAddresses = tokens.map(([tokenA, tokenB]) => {
      return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
  })
  const pairContracts = pairAddresses.map((address) =>
    address ? new Contract(I10kSwapPairABI as Abi, address, defaultProvider) : undefined
  )
  const [token0, token1] = currencyA.sortsBefore(currencyB) ? [currencyA, currencyB] : [currencyB, currencyA]
}

export const tradeExactIn = async (currencyAAmount: TokenAmount | undefined, currencyB: Token): Promise<Trade | null> => {
  if(!currencyAAmount) return null;
  const currencyA = currencyAAmount.token;
  const address = Pair.getAddress(currencyA, currencyB);
  const contract = new Contract(I10kSwapPairABI as Abi, address, defaultProvider);
  const { reserve0, reserve1 } = await contract.call('getReserves')
  const possiblePairs = [new Pair(new TokenAmount(currencyA, reserve0.toString()), new TokenAmount(currencyB, reserve1.toString()))];
  return Trade.bestTradeExactIn(possiblePairs, currencyAAmount, currencyB, {
    maxHops: 3,
    maxNumResults: 1,
  })[0]
}