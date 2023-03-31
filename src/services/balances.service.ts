import {Abi, Contract} from "starknet";
import ProtossSwapPairABI from "../abi/protoss_pair_abi.json";
import {defaultProvider} from "../constants";
import {JSBI} from "10k_swap_sdk";
import {uint256ToBN} from "starknet/utils/uint256";
import {StarknetWindowObject} from "get-starknet-core";

export const getBalance = async (wallet: StarknetWindowObject, address: string) => {
  const contract = new Contract(ProtossSwapPairABI as Abi, address , defaultProvider);
  const ret = await contract.call('balanceOf', [wallet?.account?.address.toLocaleLowerCase()])
  return JSBI.BigInt(uint256ToBN(ret[0])).toString()
}