import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import {
  JB721_DELEGATE_V1,
  JB721_DELEGATE_V1_1,
} from 'constants/delegateVersions'
import { ProjectMetadataContext } from 'contexts/shared/ProjectMetadataContext'
import { TransactionContext } from 'contexts/Transaction/TransactionContext'
import { V2V3ContractsContext } from 'contexts/v2v3/Contracts/V2V3ContractsContext'
import { V2V3ProjectContext } from 'contexts/v2v3/Project/V2V3ProjectContext'
import { V2V3ProjectContractsContext } from 'contexts/v2v3/ProjectContracts/V2V3ProjectContractsContext'
import { TransactorInstance } from 'hooks/Transactor'
import omit from 'lodash/omit'
import {
  JB721DelegateVersion,
  JB_DEPLOY_TIERED_721_DELEGATE_DATA_V1_1,
  JBDeployTiered721DelegateData,
} from 'models/nftRewards'
import { GroupedSplits, SplitGroup } from 'models/splits'
import {
  JBPayDataSourceFundingCycleMetadata,
  V2V3FundAccessConstraint,
  V2V3FundingCycleData,
} from 'models/v2v3/fundingCycle'
import { useContext } from 'react'
import { DEFAULT_MUST_START_AT_OR_AFTER } from 'redux/slices/editingV2Project'
import { NftRewardsData } from 'redux/slices/editingV2Project/types'

import { useJBPrices } from 'hooks/JBPrices'
import {
  buildDeployTiered721DelegateData,
  buildJB721TierParams,
  defaultNftCollectionName,
} from 'utils/nftRewards'
import { isValidMustStartAtOrAfter } from 'utils/v2v3/fundingCycle'
import { useV2ProjectTitle } from '../../v2v3/ProjectTitle'
import { ReconfigureFundingCycleTxParams } from '../../v2v3/transactor/ReconfigureV2V3FundingCycleTx'
import { useJB721DelegateContractAddress } from '../contracts/JB721DelegateContractAddress'
import { useJBTiered721DelegateProjectDeployer } from '../contracts/JBTiered721DelegateProjectDeployer'
import { useProjectControllerJB721DelegateVersion } from '../contracts/ProjectJB721DelegateVersion'

type ReconfigureWithNftsTxArgs = {
  reconfigureData: ReconfigureFundingCycleTxParams
  tiered721DelegateData: NftRewardsData
}

interface JB721DelegateReconfigureFundingCycleData {
  data: V2V3FundingCycleData
  metadata: JBPayDataSourceFundingCycleMetadata
  memo?: string
  fundAccessConstraints: V2V3FundAccessConstraint[]
  groupedSplits?: GroupedSplits<SplitGroup>[]
  mustStartAtOrAfter?: string // epoch seconds. anything less than "now" will start immediately.
}

function buildArgs(
  version: JB721DelegateVersion,
  {
    projectId,
    deployTiered721DelegateData,
    reconfigureFundingCyclesData,
    JBControllerAddress,
  }: {
    projectId: number
    JBControllerAddress: string
    deployTiered721DelegateData:
      | JBDeployTiered721DelegateData
      | JB_DEPLOY_TIERED_721_DELEGATE_DATA_V1_1
    reconfigureFundingCyclesData: JB721DelegateReconfigureFundingCycleData
  },
) {
  const baseArgs = [
    projectId,
    deployTiered721DelegateData, //_deployTiered721DelegateData
    reconfigureFundingCyclesData, // _reconfigureFundingCyclesData
  ]

  if (version === JB721_DELEGATE_V1) {
    return baseArgs
  }
  if (version === JB721_DELEGATE_V1_1) {
    return [...baseArgs, JBControllerAddress] // v1.1 requires us to pass the controller address in
  }
}

export function useReconfigureV2V3FundingCycleWithNftsTx(): TransactorInstance<ReconfigureWithNftsTxArgs> {
  const { transactor } = useContext(TransactionContext)
  const { contracts } = useContext(V2V3ContractsContext)
  const {
    contracts: { JBController },
  } = useContext(V2V3ProjectContractsContext)
  const { projectId } = useContext(ProjectMetadataContext)
  const { projectOwnerAddress } = useContext(V2V3ProjectContext)

  const JB721DelegateVersion = useProjectControllerJB721DelegateVersion()
  const JBTiered721DelegateStoreAddress = useJB721DelegateContractAddress({
    contractName: 'JBTiered721DelegateStore',
    version: JB721DelegateVersion,
  })
  const JBTiered721DelegateProjectDeployer =
    useJBTiered721DelegateProjectDeployer({ version: JB721DelegateVersion })
  const JBPrices = useJBPrices()

  const projectTitle = useV2ProjectTitle()

  return async (
    {
      reconfigureData: {
        fundingCycleData,
        fundingCycleMetadata,
        fundAccessConstraints,
        groupedSplits = [],
        mustStartAtOrAfter = DEFAULT_MUST_START_AT_OR_AFTER,
        memo,
      },
      tiered721DelegateData: {
        governanceType,
        rewardTiers,
        CIDs,
        collectionMetadata,
        flags,
      },
    },
    txOpts,
  ) => {
    const collectionName =
      collectionMetadata.name ?? defaultNftCollectionName(projectTitle)

    if (
      !transactor ||
      !projectId ||
      !CIDs ||
      !rewardTiers ||
      !JBTiered721DelegateStoreAddress ||
      !projectOwnerAddress ||
      !contracts ||
      !JBController ||
      !JBPrices ||
      !isValidMustStartAtOrAfter(
        mustStartAtOrAfter,
        fundingCycleData.duration,
      ) ||
      !collectionName ||
      !JBTiered721DelegateProjectDeployer
    ) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    // build `delegateData`
    const tiers = buildJB721TierParams({
      cids: CIDs,
      rewardTiers,
      version: JB721DelegateVersion,
    })

    const deployTiered721DelegateData = buildDeployTiered721DelegateData(
      {
        collectionUri: collectionMetadata.uri ?? '',
        collectionName,
        collectionSymbol: collectionMetadata.symbol ?? '',
        governanceType,
        tiers,
        ownerAddress: projectOwnerAddress,
        contractAddresses: {
          JBDirectoryAddress: getAddress(contracts.JBDirectory.address),
          JBFundingCycleStoreAddress: getAddress(
            contracts.JBFundingCycleStore.address,
          ),
          JBPricesAddress: getAddress(JBPrices.address),
          JBTiered721DelegateStoreAddress,
        },
        flags,
      },
      JB721DelegateVersion,
    )

    // NFT launch tx does not accept `useDataSourceForPay` and `dataSource` (see contracts:`JBPayDataSourceFundingCycleMetadata`)
    const dataSourceFCMetadata: JBPayDataSourceFundingCycleMetadata = omit(
      fundingCycleMetadata,
      ['useDataSourceForPay', 'dataSource'],
    )

    const reconfigureFundingCyclesData: JB721DelegateReconfigureFundingCycleData =
      {
        data: fundingCycleData,
        metadata: dataSourceFCMetadata,
        mustStartAtOrAfter,
        groupedSplits,
        fundAccessConstraints,
        memo,
      }

    const args = buildArgs(JB721DelegateVersion, {
      projectId,
      deployTiered721DelegateData,
      reconfigureFundingCyclesData,
      JBControllerAddress: JBController.address,
    })

    if (!args) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    return transactor(
      JBTiered721DelegateProjectDeployer,
      'reconfigureFundingCyclesOf',
      args,
      {
        ...txOpts,
        title: t`Setup new NFTs for ${projectTitle}`,
      },
    )
  }
}
