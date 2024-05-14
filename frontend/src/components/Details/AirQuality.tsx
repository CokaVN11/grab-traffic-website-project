import { useAppSelector } from 'libs/redux'
import chroma from 'chroma-js'
import { colors } from 'theme/colors'

export const AirQuality = () => {
  const airData = useAppSelector((state) => state.data.currentAirData)

  const getAirQualityColor = (airQuality: number) => {
    const colorScale = chroma
      .scale([colors.green, colors.yellow, colors.orange, colors.red, colors.purple, colors.dark])
      .domain([0, 50, 100, 150, 200, 300, 500])
    return colorScale(airQuality).css()
  }

  return (
    <div
      className="flex flex-col rounded-t-md p-4 text-white"
      style={{ backgroundColor: getAirQualityColor(airData?.air_quality || 0) }}>
      <div className="flex items-end justify-center align-bottom">
        <h4 className="text-7xl font-semibold">
          {airData?.air_quality_index}
          <span className="text-xl font-light"> AQI</span>
        </h4>
      </div>
      <div className="mx-20 flex flex-row items-center justify-center gap-4 rounded-md bg-white p-2 text-green-700">
        <p className="text-base font-semibold">PM2.5</p>
        <p className="text-base">{airData?.pm2_5} µg/m3</p>
      </div>
    </div>
  )
}
