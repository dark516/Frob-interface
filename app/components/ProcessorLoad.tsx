"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"

// Mock data generator for CPU load
const generateMockData = () => {
  return {
    value: Math.floor(Math.random() * 40) + 30, // Random value between 30-70%
    time: new Date().getTime(),
  }
}

export default function ProcessorLoad() {
  const [data, setData] = useState<{ value: number; time: number }[]>([])
  const [currentLoad, setCurrentLoad] = useState(0)

  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 20 }, () => generateMockData())
    setData(initialData)
    setCurrentLoad(initialData[initialData.length - 1].value)

    // Update every second
    const interval = setInterval(() => {
      const newPoint = generateMockData()
      setData((prev) => [...prev.slice(-19), newPoint])
      setCurrentLoad(newPoint.value)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Processor Load
          </div>
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentLoad}%</span>
      </CardHeader>
      <CardContent>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

