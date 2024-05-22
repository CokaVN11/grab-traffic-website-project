import { RankingBoard } from './RankingBoard'
import { useEffect, useState } from 'react'
import { RankingService } from 'services/RankingService'
import { useTranslation } from 'react-i18next'
import { airColorMap } from 'libs/utils/constant'
import SpinningProgress from 'components/SpinningProgress'

export const AirRanking = () => {
  const [data, setData] = useState<Ranking[]>([])
  const rankingService = RankingService.getInstance()
  const { t } = useTranslation()

  const rankingOptions = {
    title: t('air_quality_ranking'),
    columns: [
      { title: 'Location', key: 'location' as keyof Ranking },
      { title: 'PM2.5', key: 'value' as keyof Ranking }
    ],
    color: airColorMap
  }

  useEffect(() => {
    const fetchData = async () => {
      const rankingData = await rankingService.getCurrentRanking({ option: 'air' })
      setData(rankingData.air_ranking?.reverse() || [])
    }

    fetchData()

    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [rankingService])

  return (
    <div className="rounded-md border px-2">
      <SpinningProgress isLoading={data.length === 0}>
        <RankingBoard ranking={data} options={rankingOptions} />
      </SpinningProgress>
    </div>
  )
}

export default AirRanking
