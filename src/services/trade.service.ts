import {ChainId, Pair, Token, TokenAmount, Trade} from "10k_swap_sdk";
import I10kSwapPairABI from 'abi/l0k_pair_abi.json';
import {Contract, Abi} from "starknet";
import {defaultProvider} from "../constants";
import { IResponse } from "enums/types";
import { SERVER_URLS } from "enums";
import axios from "axios";
import {tryParseAmount} from "../utils/maths";
import {getToken} from "../utils";
export interface AllPairItem {
  token0: {
    address: string
    decimals: number
    name: string | undefined
    symbol: string
  }
  token1: {
    address: string
    decimals: number
    name: string | undefined
    symbol: string
  }
  liquidity: number
  pairAddress: string
  totalSupply: string //0x
  decimals: number
  reserve0: string //0x
  reserve1: string //0x
  APR: number
}

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

export async function getAllPairs(chainId: ChainId) {
  try {
    const res = await axios.get<IResponse<AllPairItem[]>>(`${SERVER_URLS[chainId]}/pool/pairs`)
    if (res.data.errCode === 0) {
      const data = res.data.data
      console.log(data)
      return data
        .filter((item) => {
          return !!(getToken(chainId, item.token0.address) && getToken(chainId, item.token1.address))
        })
        .map((item) => {
          const { reserve0, reserve1, totalSupply } = item
          const token0 = getToken(chainId, item.token0.address) as Token
          const token1 = getToken(chainId, item.token1.address) as Token
          const pair = new Pair(new TokenAmount(token0, reserve0), new TokenAmount(token1, reserve1))

          return {
            ...item,
            token0,
            token1,
            pair,
            totalSupply: new TokenAmount(pair.liquidityToken, totalSupply),
          }
        })
    }

    throw new Error('fetch pairs fail')
  } catch (error: any) {
    throw new Error(error)
  }
}