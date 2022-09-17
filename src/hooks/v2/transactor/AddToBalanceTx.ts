import { BigNumber } from '@ethersproject/bignumber'
import { V2UserContext } from 'contexts/v2/userContext'
import { useContext } from 'react'

import { t } from '@lingui/macro'
import { ETH_TOKEN_ADDRESS } from 'constants/v2/juiceboxTokens'
import { ProjectMetadataContext } from 'contexts/projectMetadataContext'
import { onCatch, TransactorInstance } from 'hooks/Transactor'
import invariant from 'tiny-invariant'
import { useV2ProjectTitle } from '../ProjectTitle'

const DEFAULT_METADATA = 0

export function useAddToBalanceTx(): TransactorInstance<{
  value: BigNumber
}> {
  const { transactor, contracts } = useContext(V2UserContext)
  const { projectId } = useContext(ProjectMetadataContext)
  const projectTitle = useV2ProjectTitle()

  const DEFAULT_MEMO = ''

  return ({ value }, txOpts) => {
    try {
      invariant(
        transactor &&
          projectId &&
          projectTitle &&
          contracts?.JBETHPaymentTerminal,
      )
      return transactor(
        contracts.JBETHPaymentTerminal,
        'addToBalanceOf',
        [projectId, value, ETH_TOKEN_ADDRESS, DEFAULT_MEMO, DEFAULT_METADATA],
        {
          ...txOpts,
          value,
          title: t`Add to balance of ${projectTitle}`,
        },
      )
    } catch {
      const missingParam = !transactor
        ? 'transactor'
        : !projectId
        ? 'projectId'
        : !contracts?.JBETHPaymentTerminal
        ? 'contracts.JBETHPaymentTerminal'
        : undefined

      return onCatch({
        txOpts,
        missingParam,
        cv: '2',
        functionName: 'addToBalanceOf',
      })
    }
  }
}
