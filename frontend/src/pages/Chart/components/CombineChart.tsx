import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import dayjs from 'libs/utils/dayjsConfig'
import type { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { Spin, Tabs } from 'antd'
import colors from 'tailwindcss/colors'
import { useTranslation } from 'react-i18next'
import { getColorForValue, translateColor } from 'libs/utils/helper'
import { airColorMap } from 'libs/utils/constant'
import { useMediaQuery } from 'react-responsive'
import './CombineChart.css'
import { FaCar, FaWind } from 'react-icons/fa'

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  BarElement,
  LineElement,
  LineController,
  BarController
)

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Quality Index'
      }
    }
  }
}

interface CombineChartProps {
  location: string
  rawData: TrafficAirData[]
  labels: string[]
  startDate: Dayjs
  endDate: Dayjs
}

const trafficColorMap = [
  { range: [0, 5.99] as [number, number], color: colors.cyan[200] },
  { range: [6, 10.99] as [number, number], color: colors.cyan[300] },
  { range: [11, 15.99] as [number, number], color: colors.cyan[400] },
  { range: [16, 20.99] as [number, number], color: colors.cyan[500] },
  { range: [21, 25.99] as [number, number], color: colors.cyan[600] },
  { range: [26, 9999] as [number, number], color: colors.cyan[700] }
]

type colorMapType = { range: [number, number]; color: string }

const getColorByTime = (
  value: number,
  getColorForValueHandler: (value: number, colorMap: colorMapType[]) => string,
  colorMap: colorMapType[],
  startDate?: Dayjs,
  label?: string
) => {
  const color = getColorForValueHandler(value, colorMap)
  if (!startDate && !label) {
    return color
  }
  if (dayjs().isBefore(startDate, 'day')) {
    return translateColor(color, -0.5)
  }
  if (dayjs().isSame(startDate, 'day')) {
    if (label?.includes(':') && label > dayjs().format('HH:mm')) {
      return translateColor(color, -0.5)
    }
  }

  return color
}

const TabLabel = ({ leadingIcon, label }: { leadingIcon: React.ReactNode; label: string }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  return (
    <div className="flex items-center">
      {leadingIcon}
      <span className={`ml-2 ${isMobile ? 'hidden' : ''}`}>{label}</span>
    </div>
  )
}

export const CombineChart = ({ location, rawData, labels, startDate, endDate }: CombineChartProps) => {
  const [chartTrafficData, setChartTrafficData] = useState<ChartData<'bar'>>()
  const [chartAirData, setChartAirData] = useState<ChartData<'line'>>()
  const [airChartOptions, setAirChartOptions] = useState<ChartOptions<'line'>>(
    commonChartOptions as ChartOptions<'line'>
  )
  const [trafficChartOptions, setTrafficChartOptions] = useState<ChartOptions<'bar'>>(
    commonChartOptions as ChartOptions<'bar'>
  )
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const airQualityDataset = {
          type: 'line' as const,
          label: t('air_quality'),
          pointRadius: 4,
          borderColor: colors.slate[400],
          borderDash: [5, 5],
          pointBorderColor: (context: { raw: number; dataIndex: number; chart: { data: { labels: string[] } } }) => {
            const label = context.chart.data.labels[context.dataIndex]
            return getColorByTime(context.raw, getColorForValue, airColorMap, startDate, label)
          },
          pointBackgroundColor: (context: { raw: number }) =>
            context.raw ? getColorForValue(context.raw, airColorMap) : 'transparent',
          pointBorderWidth: 2,
          pointHoverBorderColor: colors.slate[400],
          borderWidth: 2,
          pointHoverRadius: 8,
          pointHitRadius: 4,
          borderJoinStyle: 'round',
          data: rawData.map((item: TrafficAirData) => item.air_data?.air_quality_index ?? 0),
          yAxisID: 'y'
        } as ChartData<'line'>['datasets'][0]

        const trafficDataset = {
          type: 'bar' as const,
          label: t('traffic'),
          backgroundColor: (context: { raw: number }) =>
            context.raw ? getColorForValue(context.raw, trafficColorMap) : 'black',
          borderColor: (context: { raw: number; dataIndex: number; chart: { data: { labels: string[] } } }) => {
            const label = context.chart.data.labels[context.dataIndex]
            const color = getColorByTime(context.raw, getColorForValue, trafficColorMap, startDate, label)
            return color
          },
          borderWidth: 2,
          hoverBackgroundColor: colors.cyan[700],
          transitions: {
            duration: 1000,
            easing: 'easeInOutCubic'
          },
          data: rawData.map((item: TrafficAirData) => item.traffic_data?.traffic_quality_index ?? 0),
          yAxisID: 'y1'
        } as ChartData<'bar'>['datasets'][0]

        setChartAirData({ labels, datasets: [airQualityDataset] })
        setChartTrafficData({ labels, datasets: [trafficDataset] })

        setAirChartOptions({
          ...commonChartOptions,
          plugins: {
            title: {
              display: true,
              text: `${location ?? 'Ba Tháng Hai - Sư Vạn Hạnh'} ${startDate.format('DD/MM/YYYY')}${endDate.isSame(startDate, 'day') ? '' : `-${endDate.format('DD/MM/YYYY')}`}`
            }
          },
          scales: {
            y: {
              ...commonChartOptions.scales?.y,
              suggestedMax:
                Math.max(...rawData.map((item: TrafficAirData) => item.air_data?.air_quality_index ?? 0)) * 1.3,
              title: {
                display: true,
                text: t('air_quality_index')
              }
            }
          }
        })

        setTrafficChartOptions({
          ...commonChartOptions,
          plugins: {
            title: {
              display: true,
              text: `${location ?? 'Ba Tháng Hai - Sú Vạn Hạnh'} ${startDate.format('DD/MM/YYYY')}${endDate.isSame(startDate, 'day') ? '' : `-${endDate.format('DD/MM/YYYY')}`}`
            }
          },
          scales: {
            y1: {
              ...commonChartOptions.scales?.y,
              suggestedMax:
                Math.max(...rawData.map((item: TrafficAirData) => item.traffic_data?.traffic_quality_index ?? 0)) * 1.3,
              title: {
                display: true,
                text: t('traffic_quality_index')
              }
            }
          }
        })
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rawData, labels, location, startDate, endDate, t])
  return (
    <div className="h-[20rem] w-full rounded-md border border-gray-200 md:h-[36.5rem] lg:col-span-8">
      <Spin spinning={loading} tip={t('loading...')} fullscreen />
      <Tabs tabPosition="left" style={{ height: '100%' }} centered>
        <Tabs.TabPane
          tab={TabLabel({
            leadingIcon: <FaWind />,
            label: t('air_quality')
          })}
          key="air"
          className="h-[20rem] md:h-[36.5rem]"
          id="air-tab">
          <Line data={chartAirData || { labels: [], datasets: [] }} options={airChartOptions} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={TabLabel({ leadingIcon: <FaCar />, label: t('traffic') })}
          key="traffic"
          className="h-[20rem] md:h-[36.5rem]"
          id="traffic-tab">
          <Bar data={chartTrafficData || { labels: [], datasets: [] }} options={trafficChartOptions} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default CombineChart
