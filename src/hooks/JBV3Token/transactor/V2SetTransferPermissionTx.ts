import { V2V3ProjectContext } from 'contexts/v2v3/Project/V2V3ProjectContext'
import { TransactorInstance } from 'hooks/Transactor'
import { useSetOperatorTx } from 'hooks/v2v3/transactor/SetOperatorTx'
import { V2V3OperatorPermission } from 'models/v2v3/permissions'
import { useContext } from 'react'
import { useJBV3Token } from '../contracts/JBV3Token'
import { useJBOperatorStoreForV3Token } from '../contracts/JBOperatorStoreForV3Token'

export function useV2SetTransferPermissionTx(): TransactorInstance {
  const { tokenAddress } = useContext(V2V3ProjectContext)

  const JBV3TokenContract = useJBV3Token({ tokenAddress })
  const setOperatorTx = useSetOperatorTx()

  const JBOperatorStore = useJBOperatorStoreForV3Token()

  return (_, txOpts) => {
    if (!JBOperatorStore || !JBV3TokenContract) return Promise.reject()

    return setOperatorTx(
      {
        operatorAddress: JBV3TokenContract?.address,
        permissionIndexes: [V2V3OperatorPermission.TRANSFER],
        contractOverride: JBOperatorStore,
      },
      txOpts,
    )
  }
}
