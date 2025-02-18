import { V2V3ContractsContext } from 'contexts/v2v3/Contracts/V2V3ContractsContext'
import { V2V3ProjectContext } from 'contexts/v2v3/Project/V2V3ProjectContext'
import { useContractReadValue } from 'hooks/ContractReader'
import { useContext } from 'react'
import { useJBV3Token } from '../contracts/JBV3Token'
import { useLoadContractFromAddress } from 'hooks/LoadContractFromAddress'
import { Contract } from '@ethersproject/contracts'

export function useJBTokenStoreForV3Token(): Contract | undefined {
  const { tokenAddress } = useContext(V2V3ProjectContext)
  const { contracts } = useContext(V2V3ContractsContext)

  const JBV3TokenContract = useJBV3Token({ tokenAddress })

  const { value: v2TokenStoreAddress } = useContractReadValue<string, string>({
    contract: JBV3TokenContract,
    functionName: 'v2TokenStore',
    args: [],
  })
  const JBTokenStore = useLoadContractFromAddress({
    address: v2TokenStoreAddress,
    abi: contracts?.JBTokenStore.interface,
  })

  return JBTokenStore
}
