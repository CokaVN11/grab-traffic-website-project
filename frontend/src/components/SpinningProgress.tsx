import React, { useState, useEffect } from 'react'
import { Spin, Progress, ProgressProps } from 'antd'
import colors from 'tailwindcss/colors'

interface SpinningProgressProps {
  isLoading?: boolean
  children?: React.ReactNode
  fullscreen?: boolean
}

const conicColors: ProgressProps['strokeColor'] = {
  '0%': colors.indigo[600],
  '50%': colors.emerald[600],
  '100%': colors.indigo[600]
}

const SpinningProgress: React.FC<SpinningProgressProps> = ({ isLoading, children, fullscreen }) => {
  const [percent, setPercent] = useState(0)
  const percentRef = React.useRef(percent)
  const interval = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading === undefined) {
      setPercent(0)
      percentRef.current = 0
      interval.current = setInterval(() => {
        setPercent((prevPercent) => {
          const increment = prevPercent < 90 ? 1 : 5 // Faster increment after 90%
          percentRef.current = Math.min(prevPercent + increment, 100)
          return Math.min(prevPercent + increment, 100)
        })
      })
    } else if (isLoading === true) {
      setPercent(0) // Reset progress when loading starts
      percentRef.current = 0
      interval.current = setInterval(() => {
        setPercent((prevPercent) => {
          const increment = prevPercent < 90 ? 1 : 5 // Faster increment after 90%
          percentRef.current = Math.min(prevPercent + increment, 100)
          return Math.min(prevPercent + increment, 100)
        })
      }, 150)
    } else {
      // if loading is finished, but percent is not 100, make it faster
      if (percentRef.current < 100) {
        // clear old interval
        if (interval.current) clearInterval(interval.current)
        interval.current = setInterval(() => {
          setPercent((prevPercent) => {
            const increment = prevPercent < 90 ? 5 : 10 // Faster increment after 90%
            percentRef.current = Math.min(prevPercent + increment, 100)
            return Math.min(prevPercent + increment, 100)
          })
        }, 10)
      }
    }
    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [isLoading])

  useEffect(() => {
    if (percent === 100) {
      if (interval.current) clearInterval(interval.current)
    }
  }, [percent])

  return (
    <div className="custom-spin-container">
      <Spin
        spinning={percent < 100}
        rootClassName="h-full w-full"
        indicator={<Progress type="circle" percent={percent} size={'small'} strokeColor={conicColors} />}
        fullscreen={fullscreen}>
        {children}
      </Spin>
    </div>
  )
}

export default SpinningProgress
