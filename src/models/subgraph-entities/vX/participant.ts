import { BigNumber } from '@ethersproject/bignumber'
import { PV } from 'models/pv'
import {
  parseBigNumberKeyVals,
  parseSubgraphEntitiesFromJson,
} from 'utils/graph'

import { Json, primitives } from '../../json'
import {
  BaseProjectEntity,
  parseBaseProjectEntityJson,
} from '../base/base-project-entity'
import { Wallet } from './wallet'

export interface Participant extends BaseProjectEntity {
  pv: PV
  wallet: Wallet
  totalPaid: BigNumber
  totalPaidUSD: BigNumber
  balance: BigNumber
  stakedBalance: BigNumber
  erc20Balance: BigNumber
  lastPaidTimestamp: number
}

export const parseParticipantJson = (j: Json<Participant>): Participant => ({
  ...primitives(j),
  ...parseBaseProjectEntityJson(j),
  ...parseSubgraphEntitiesFromJson(j, ['wallet']),
  ...parseBigNumberKeyVals(j, [
    'totalPaid',
    'totalPaidUSD',
    'balance',
    'stakedBalance',
    'erc20Balance',
  ]),
})
