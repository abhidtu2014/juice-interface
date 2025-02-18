import { Trans } from '@lingui/macro'
import { Skeleton } from 'antd'
import ProjectLogo from 'components/ProjectLogo'
import ETHAmount from 'components/currency/ETHAmount'
import { useProjectMetadata } from 'hooks/ProjectMetadata'
import { Project } from 'models/subgraph-entities/vX/project'
import { v2v3ProjectRoute } from 'utils/routes'
import { HomepageCard } from './HomepageCard'

export const PROJECT_CARD_BORDER =
  'rounded-lg border drop-shadow-[0_4px_14px_rgba(0,0,0,0.03)] border-solid border-grey-200 dark:border-slate-500'
export const PROJECT_CARD_BORDER_HOVER =
  'hover:border-grey-300 dark:hover:border-slate-400 hover:-translate-y-1 transition-shadow hover:drop-shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform transition-colors'
export const PROJECT_CARD_BG = 'bg-white dark:bg-slate-700 overflow-hidden'

function Statistic({
  name,
  value,
}: {
  name: string | JSX.Element
  value: string | number | JSX.Element
}) {
  return (
    <div>
      <div className="text-secondary mb-1 text-xs font-medium uppercase">
        <Trans>{name}</Trans>
      </div>
      <div className="text-primary font-heading text-xl font-medium">
        {value}
      </div>
    </div>
  )
}

export function HomepageProjectCardSkeleton() {
  return (
    <HomepageCard
      img={<Skeleton.Input className="h-[192px] w-full" active size="small" />}
      title={<Skeleton.Input className="h-6 w-full" active size="small" />}
    />
  )
}

// Used in Trending Projects Caroursel and Juicy Picks section
export function HomepageProjectCard({
  project,
  lazyLoad,
}: {
  project: Pick<
    Project,
    | 'terminal'
    | 'metadataUri'
    | 'totalPaid'
    | 'paymentsCount'
    | 'handle'
    | 'pv'
    | 'projectId'
  >
  lazyLoad?: boolean
}) {
  const { data: metadata, isLoading } = useProjectMetadata(project.metadataUri)

  return (
    <HomepageCard
      href={v2v3ProjectRoute(project)}
      img={
        <ProjectLogo
          className="h-[192px] w-full rounded-none object-cover"
          uri={metadata?.logoUri}
          name={metadata?.name}
          projectId={project.projectId}
          lazyLoad={lazyLoad}
        />
      }
      title={
        metadata && !isLoading ? (
          <div className="max-h-8 truncate font-heading text-lg font-medium text-grey-900 dark:text-slate-100 md:text-xl">
            {metadata.name}
          </div>
        ) : (
          <Skeleton.Input
            className="h-6 w-full"
            active
            size="small"
            style={{ width: '100%' }}
          />
        )
      }
      description={
        <div className="flex gap-8">
          <Statistic
            name={<Trans>Volume</Trans>}
            value={<ETHAmount amount={project.totalPaid} precision={2} />}
          />
          <Statistic
            name={<Trans>Payments</Trans>}
            value={project.paymentsCount}
          />
        </div>
      }
    />
  )
}
