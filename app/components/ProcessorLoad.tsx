"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu } from "lucide-react"

interface ProcessorData {
  value: number
  time: number
}

export default function ProcessorLoad() {
  // Modify the ProcessorLoad component to show no connection status
  const [realtimeData, setRealtimeData] = useState<ProcessorData[]>([
    { value: 0, time: Date.now() - 50000 },
    { value: 0, time: Date.now() - 40000 },
    { value: 0, time: Date.now() - 30000 },
    { value: 0, time: Date.now() - 20000 },
    { value: 0, time: Date.now() - 10000 },
    { value: 0, time: Date.now() },
  ])
  const [historicalData, setHistoricalData] = useState<ProcessorData[]>([
    { value: 0, time: Date.now() - 50000 },
    { value: 0, time: Date.now() - 40000 },
    { value: 0, time: Date.now() - 30000 },
    { value: 0, time: Date.now() - 20000 },
    { value: 0, time: Date.now() - 10000 },
    { value: 0, time: Date.now() },
  ])
  const [currentLoad, setCurrentLoad] = useState(0)

  useEffect(() => {
    // No need to subscribe to websocket events
    return () => {
      // No cleanup needed
    }
  }, [])

  const formatTime = (time: number) => {
    return new Date(time).toLocaleTimeString()
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Processor Load
          </div>
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentLoad.toFixed(1)}%</span>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="realtime">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="realtime">Realtime</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
          </TabsList>
          <TabsContent value="realtime">
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
          </TabsContent>
          <TabsContent value="historical">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                  <XAxis dataKey="time" tickFormatter={formatTime} angle={-45} textAnchor="end" height={50} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={formatTime}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Load"]}
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
