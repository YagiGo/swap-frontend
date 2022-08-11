import { TokenAmount, Pair, Token } from '../sdk/index'
import I10kSwapPairABI from '../constants/abis/l0k_pair_abi.json'

import { useStarknetCalls } from '../starknet-vue/hooks/call'
import { computed, ComputedRef, Ref, toRaw } from 'vue'
import { useStarknet } from '../starknet-vue/providers/starknet'
import { Abi, Contract } from 'starknet'
import { uint256ToBN } from 'starknet/dist/utils/uint256'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(tokens: ComputedRef<[Token | undefined, Token | undefined][]>): ComputedRef<Array<[PairState, Pair | null]>> {
  const {
    state: { library },
  } = useStarknet()

  const pairAddresses = computed(() =>
    tokens.value.map(([tokenA, tokenB]) => {
      return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
    })
  )

  const contracts = computed(() => {
    if (!pairAddresses.value) {
      return undefined
    }
    const pairContracts = pairAddresses.value.map((address) =>
      address ? new Contract(I10kSwapPairABI as Abi, address, toRaw(library.value)) : undefined
    )
    if (pairContracts.some((item) => item === undefined)) {
      return undefined
    }
    return pairContracts as Contract[]
  })
  const methods = computed(() => contracts.value?.map(() => 'getReserves'))
  const { states } = useStarknetCalls(contracts, methods)

  return computed(() => {
    if (!states.data) {
      return []
    }
    return states.data?.map((reserves, i) => {
      // uint256ToBN
      const tokenA = tokens.value[i][0]
      const tokenB = tokens.value[i][1]

      if (states.loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, uint256ToBN(reserve0).toString()), new TokenAmount(token1, uint256ToBN(reserve1).toString())),
      ]
    })
  })
}

export function usePair(tokenA?: Ref<Token>, tokenB?: Ref<Token>): ComputedRef<[PairState, Pair | null]> {
  const pairs = usePairs(computed(() => [[tokenA?.value, tokenB?.value]]))

  return computed(() => {
    return pairs.value?.[0]
  })
}
