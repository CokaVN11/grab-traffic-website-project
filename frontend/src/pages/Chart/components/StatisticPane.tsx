import { Statistic, StatisticProps } from 'antd'
import CountUp from 'react-countup'

const formatter: StatisticProps['formatter'] = (value) => <CountUp end={value as number} separator="." />
const Items = ({ title, value }: { title: string; value: string | number }) => (
  <div className="flex w-full flex-row justify-between space-x-4">
    <span className="text-xl font-medium">{title}:</span>
    <Statistic value={value} formatter={formatter} className="text-lg " />
  </div>
)

export const StatisticPane = ({ className }: { className?: string }) => {
  return (
    <div className={className ?? ''}>
      <div className="flex w-full items-center justify-between">
        <span className="font-medium md:text-lg">Rush hours</span>
        <span className="text-red-500 md:text-lg">7AM - 9AM</span>
      </div>
      <h3 className="text-center text-xl font-bold uppercase">Average</h3>
      <div className="flex flex-col items-center justify-between space-y-4 rounded-md border border-red-200 px-8 py-2">
        <Items title="Cars" value={100} />
        <Items title="Bikes" value={50} />
        <Items title="Pedestrians" value={30} />
        <Items title="Trucks" value={20} />
      </div>
    </div>
  )
}
