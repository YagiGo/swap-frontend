import {Abi, Contract} from "starknet";
import I10kSwapPairABI from "../abi/l0k_pair_abi.json";
import {defaultProvider} from "../constants";
import {JSBI} from "10k_swap_sdk";
import {uint256ToBN} from "starknet/utils/uint256";
import {StarknetWindowObject} from "get-starknet-core";

export const getBalance = async (wallet: StarknetWindowObject, address: string) => {
  const contract = new Contract(I10kSwapPairABI as Abi, address , defaultProvider);
  const ret = await contract.call('balanceOf', [wallet?.account?.address.toLocaleLowerCase()])
  return JSBI.BigInt(uint256ToBN(ret[0])).toString()
}