import React, { lazy, useEffect, useState } from 'react'
import {
  useAppDispatch,
  useAppSelector,
  setShowDetails,
  setCurrentAirData,
  setCurrentTrafficData,
  setCurrentLocationID,
  useInitEnvironData
} from 'libs/redux'
import { FaChevronRight } from 'react-icons/fa'
import { Tabs, TabsProps, theme } from 'antd'
import { useMediaQuery } from 'react-responsive'
import StickyBox from 'react-sticky-box'
import dayjs from 'libs/utils/dayjsConfig'
import { useTranslation } from 'react-i18next'
import SpinningProgress from 'components/SpinningProgress'

const AirQuality = lazy(() => import('./AirQuality'))
const Weather = lazy(() => import('./Weather'))
const Traffic = lazy(() => import('./Traffic'))
const DragCloseDrawer = lazy(() => import('./DragCloseDrawer'))

const CustomTabPane: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col">{children}</div>
}

const CustomTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => {
  const {
    token: { colorBgContainer }
  } = theme.useToken()
  return (
    <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 10 }}>
      <DefaultTabBar
        {...props}
        style={{ background: colorBgContainer }}
        className="text-md ring-offset-opacity-50 ring-offset-solid ring-offset-opacity-50 ring-offset-solid inline-flex items-center justify-between whitespace-nowrap rounded-sm px-3 py-1.5 font-bold uppercase ring-offset-2 ring-offset-background transition-all duration-300 ease-in-out"
      />
    </StickyBox>
  )
}

const enum FontSize {
  sm = 'text-sm',
  md = 'text-md',
  lg = 'text-lg'
}

export const Details: React.FC = () => {
  const dispatch = useAppDispatch()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const { showDetails, district } = useAppSelector((state) => state.page)
  const [isLoading, setIsLoading] = useState(true)
  const [fontSize, setFontSize] = useState<FontSize>(FontSize.md)
  const { currentTrafficData: trafficData, currentAirData: airData } = useAppSelector((state) => state.data)
  const { t } = useTranslation()

  const baseClass =
    'bg-white transition-[margin-right] ease-in-out duration-500 fixed md:static top-0 bottom-0 right-0 z-40 pt-2 pr-4 pl-4 w-full sm:w-[526px] text-black'
  const appendClass = showDetails ? ' mr-0' : ' hidden'

  useInitEnvironData()

  useEffect(() => {
    if (trafficData && airData) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [trafficData, airData])

  const tabsItems = [
    {
      key: 'airq',
      label: t('air_quality'),
      children: (
        <CustomTabPane key="airq">
          <SpinningProgress isLoading={isLoading}>
            <AirQuality />
            <Weather />
          </SpinningProgress>
        </CustomTabPane>
      )
    },
    {
      key: 'traffic',
      label: t('traffic'),
      children: (
        <CustomTabPane key="traffic">
          <Traffic />
        </CustomTabPane>
      )
    }
  ]

  useEffect(() => {
    if (district && district.length > 25) {
      setFontSize(FontSize.md)
    } else {
      setFontSize(FontSize.lg)
    }
  }, [district])

  const closeDrawer = (open: boolean) => {
    if (!open) {
      dispatch(setShowDetails({ showDetails: false, district: null }))
      dispatch(setCurrentAirData(undefined))
      dispatch(setCurrentTrafficData(undefined))
      dispatch(setCurrentLocationID(-1))
    }
  }

  return !isMobile ? (
    <div className={`${baseClass}${appendClass}`}>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div></div>
          <div className="flex flex-col items-center justify-center">
            <h2 className={`${fontSize} font-bold`}>{district}</h2>
            <p className="text-xs leading-3">{dayjs().format('HH:mm DD/MM/YYYY')}</p>
          </div>
          <button onClick={() => closeDrawer(false)} className="flex items-center justify-center">
            <FaChevronRight />
          </button>
        </div>
        <Tabs defaultActiveKey="airq" centered items={tabsItems} renderTabBar={CustomTabBar} />
      </div>
    </div>
  ) : (
    <DragCloseDrawer open={showDetails} setOpen={closeDrawer}>
      <div className="mr-0 w-full overflow-y-auto bg-white p-4 text-black">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div></div>
            <div className="flex flex-col items-center justify-center">
              <h2 className={`${fontSize} font-bold`}>{district}</h2>
              <p className="text-xs leading-3">{dayjs().format('HH:mm DD/MM/YYYY')}</p>
            </div>
            <div></div>
          </div>
          <Tabs defaultActiveKey="airq" centered items={tabsItems} renderTabBar={CustomTabBar} />
        </div>
      </div>
    </DragCloseDrawer>
  )
}

export default Details
