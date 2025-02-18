import { ProjectMetadataContext } from 'contexts/shared/ProjectMetadataContext'
import { V1ProjectContextType } from 'contexts/v1/Project/V1ProjectContext'
import { useCurrencyConverter } from 'hooks/CurrencyConverter'
import useSymbolOfERC20 from 'hooks/ERC20/SymbolOfERC20'
import { useProjectsQuery } from 'hooks/Projects'
import { useV1TerminalVersion } from 'hooks/v1/contractReader/V1TerminalVersion'
import { V1CurrencyOption } from 'models/v1/currencyOption'
import { useContext, useMemo } from 'react'
import { V1CurrencyName } from 'utils/v1/currency'
import useBalanceOfProject from '../../../hooks/v1/contractReader/BalanceOfProject'
import useCurrentFundingCycleOfProject from '../../../hooks/v1/contractReader/CurrentFundingCycleOfProject'
import useCurrentPayoutModsOfProject from '../../../hooks/v1/contractReader/CurrentPayoutModsOfProject'
import useCurrentTicketModsOfProject from '../../../hooks/v1/contractReader/CurrentTicketModsOfProject'
import useOverflowOfProject from '../../../hooks/v1/contractReader/OverflowOfProject'
import useOwnerOfProject from '../../../hooks/v1/contractReader/OwnerOfProject'
import useQueuedFundingCycleOfProject from '../../../hooks/v1/contractReader/QueuedFundingCycleOfProject'
import useQueuedPayoutModsOfProject from '../../../hooks/v1/contractReader/QueuedPayoutModsOfProject'
import useQueuedTicketModsOfProject from '../../../hooks/v1/contractReader/QueuedTicketModsOfProject'
import useTerminalOfProject from '../../../hooks/v1/contractReader/TerminalOfProject'
import useTokenAddressOfProject from '../../../hooks/v1/contractReader/TokenAddressOfProject'

export function useV1ProjectState({
  handle,
}: {
  handle: string
}): V1ProjectContextType {
  const { projectId } = useContext(ProjectMetadataContext)

  const owner = useOwnerOfProject(projectId)
  const terminalAddress = useTerminalOfProject(projectId)
  const { version: terminalVersion, name: terminalName } = useV1TerminalVersion(
    { terminalAddress },
  )
  const currentFC = useCurrentFundingCycleOfProject(projectId, terminalName)
  const queuedFC = useQueuedFundingCycleOfProject(projectId)
  const currentPayoutMods = useCurrentPayoutModsOfProject(
    projectId,
    currentFC?.configured,
  )
  const queuedPayoutMods = useQueuedPayoutModsOfProject(
    projectId,
    queuedFC?.configured,
  )
  const currentTicketMods = useCurrentTicketModsOfProject(
    projectId,
    currentFC?.configured,
  )
  const queuedTicketMods = useQueuedTicketModsOfProject(
    projectId,
    queuedFC?.configured,
  )
  const tokenAddress = useTokenAddressOfProject(projectId)
  const { data: tokenSymbol } = useSymbolOfERC20(tokenAddress)
  const balance = useBalanceOfProject(projectId, terminalName)
  const converter = useCurrencyConverter()
  const balanceInCurrency = useMemo(
    () =>
      balance &&
      converter.wadToCurrency(
        balance,
        V1CurrencyName(currentFC?.currency.toNumber() as V1CurrencyOption),
        'ETH',
      ),
    [balance, converter, currentFC],
  )
  const overflow = useOverflowOfProject(projectId, terminalName)

  const { data: projects } = useProjectsQuery({
    projectId: projectId,
    keys: ['createdAt', 'totalPaid'],
  })

  const createdAt = projects?.[0]?.createdAt
  const earned = projects?.[0]?.totalPaid

  const project = useMemo<V1ProjectContextType>((): V1ProjectContextType => {
    const projectType = 'standard'

    return {
      createdAt,
      projectType,
      owner,
      earned,
      handle,
      currentFC,
      queuedFC,
      currentPayoutMods,
      currentTicketMods,
      queuedPayoutMods,
      queuedTicketMods,
      tokenAddress,
      tokenSymbol,
      balance,
      balanceInCurrency,
      overflow,
      terminal: {
        address: terminalAddress,
        name: terminalName,
        version: terminalVersion,
      },
    }
  }, [
    balance,
    balanceInCurrency,
    overflow,
    createdAt,
    currentFC,
    currentPayoutMods,
    currentTicketMods,
    earned,
    handle,
    owner,
    queuedFC,
    queuedPayoutMods,
    queuedTicketMods,
    tokenAddress,
    tokenSymbol,
    terminalVersion,
    terminalName,
    terminalAddress,
  ])

  return project
}
