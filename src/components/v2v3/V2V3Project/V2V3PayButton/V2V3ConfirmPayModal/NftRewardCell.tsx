import { Tooltip } from 'antd'
import ExternalLink from 'components/ExternalLink'
import { JuiceVideoThumbnailOrImage } from 'components/NftRewards/NftVideo/JuiceVideoThumbnailOrImage'
import { NftRewardTier } from 'models/nftRewards'
import { classNames } from 'utils/classNames'
import { ipfsUriToGatewayUrl } from 'utils/ipfs'

const NFT_DISPLAY_HEIGHT_CLASS = 'h-12' //rem height
const NFT_DISPLAY_WIDTH_CLASS = 'w-12'

export function NftRewardCell({
  nftRewards,
}: {
  nftRewards: NftRewardTier[]
}): JSX.Element {
  const uniqueTiersIdsAndCounts = nftRewards.reduce(
    (acc: Record<number, number>, curr) => {
      acc[curr.id ?? -1] = (acc[curr.id ?? -1] || 0) + 1
      return acc
    },
    {},
  )
  return (
    <div className="flex flex-col gap-4">
      {Object.keys(uniqueTiersIdsAndCounts).map((tierId, idx) => {
        const tier = nftRewards.find(_tier => _tier.id === parseInt(tierId))
        if (!tier?.id) return
        const tierCount = uniqueTiersIdsAndCounts[tier.id]
        const isLink = tier.externalLink

        return (
          <div
            className={`flex gap-3 ${NFT_DISPLAY_HEIGHT_CLASS} items-center justify-end`}
            key={idx}
          >
            <ExternalLink
              className={classNames(
                'text-black dark:text-grey-100',
                isLink
                  ? 'cursor-pointer text-black hover:text-bluebs-500 hover:underline dark:text-grey-100 dark:hover:text-bluebs-500'
                  : 'cursor-default',
              )}
              href={isLink ? tier.externalLink : undefined}
            >
              {tier.name}
            </ExternalLink>
            <div>({tierCount})</div>

            <Tooltip
              title={tier.description}
              open={tier.description ? undefined : false}
              className={'pt-0'}
            >
              <JuiceVideoThumbnailOrImage
                src={ipfsUriToGatewayUrl(tier.fileUrl)}
                alt={tier.name}
                crossOrigin="anonymous"
                heightClass={NFT_DISPLAY_HEIGHT_CLASS}
                widthClass={NFT_DISPLAY_WIDTH_CLASS}
                playIconPosition="hidden"
                showPreviewOnClick
              />
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
