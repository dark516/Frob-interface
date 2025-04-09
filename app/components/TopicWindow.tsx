"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Play, Square } from "lucide-react"
import LidarView from "./visualizations/LidarView"
import CameraView from "./visualizations/CameraView"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TopicWindowProps {
  topicName: string
  isMobile?: boolean
}

const mockTopicData = {
  "/cmd_vel": {
    type: "geometry_msgs/Twist",
    data: '{"linear":{"x":0,"y":0,"z":0},"angular":{"x":0,"y":0,"z":0}}',
    frequency: "10 Hz",
    template: '{"linear":{"x":0,"y":0,"z":0},"angular":{"x":0,"y":0,"z":0}}',
  },
  "/battery_state": {
    type: "sensor_msgs/BatteryState",
    data: '{"percentage":75,"voltage":12.5}',
    frequency: "1 Hz",
    template: '{"percentage":0,"voltage":0}',
  },
  "/joint_states": {
    type: "sensor_msgs/JointState",
    data: '{"position":[0,0,0],"velocity":[0,0,0]}',
    frequency: "50 Hz",
    template: '{"position":[0,0,0],"velocity":[0,0,0]}',
  },
  "/camera/image_raw": {
    type: "sensor_msgs/Image",
    data: '{"width":640,"height":480,"encoding":"rgb8"}',
    frequency: "30 Hz",
    template: '{"width":0,"height":0,"encoding":""}',
  },
  "/scan": {
    type: "sensor_msgs/LaserScan",
    data: '{"ranges":[1.0,1.5,2.0,2.5,3.0],"angle_min":-3.14,"angle_max":3.14,"angle_increment":0.01}',
    frequency: "40 Hz",
    template: '{"ranges":[],"angle_min":0,"angle_max":0,"angle_increment":0}',
  },
}

export default function TopicWindow({ topicName, isMobile = false }: TopicWindowProps) {
  // Modify the TopicWindow component to show no connection status
  const [topicData, setTopicData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>("Not connected to robot. Topic data is simulated.")
  const [publishData, setPublishData] = useState("")
  const [publishRate, setPublishRate] = useState("1")
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishInterval, setPublishInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Set mock data based on the topic name
    setTopicData(
      mockTopicData[topicName] || {
        type: "unknown",
        data: "{}",
        frequency: "0 Hz",
        template: "{}",
      },
    )
    setLoading(false)

    return () => {
      if (publishInterval) {
        clearInterval(publishInterval)
      }
    }
  }, [topicName])

  const handlePublish = () => {
    setError("Cannot publish: No connection to robot")
  }

  const toggleContinuousPublish = useCallback(() => {
    setError("Cannot publish: No connection to robot")
  }, [])

  const validateAndFormatJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      throw new Error("Invalid JSON format")
    }
  }, [])

  /*
  const handlePublish = () => {
    try {
      const data = JSON.parse(publishData)
      wsConnection.send({
        type: "ros2",
        action: "publish",
        payload: {
          topic: topicName,
          message: data,
        },
      })
    } catch (e) {
      setError("Invalid JSON data")
    }
  }
  */

  /*
  const toggleContinuousPublish = useCallback(() => {
    if (isPublishing) {
      if (publishInterval) {
        clearInterval(publishInterval)
        setPublishInterval(null)
      }
    } else {
      try {
        validateAndFormatJSON(publishData)
        const rate = Math.max(0.1, Math.min(100, Number.parseFloat(publishRate)))

        if (rate > 0) {
          const interval = setInterval(() => {
            console.log(`Publishing to ${topicName}:`, publishData)
            setTopicData((prev) => ({
              ...prev,
              data: publishData,
            }))
          }, 1000 / rate)
          setPublishInterval(interval)
        }
        setError(null)
      } catch (e) {
        setError("Invalid JSON data or publish rate")
        return
      }
    }
    setIsPublishing(!isPublishing)
  }, [isPublishing, publishInterval, publishData, publishRate, topicName, validateAndFormatJSON])
  */

  const formatData = useCallback(() => {
    try {
      const formatted = validateAndFormatJSON(publishData)
      setPublishData(formatted)
      setError(null)
    } catch (e) {
      setError("Invalid JSON data")
    }
  }, [publishData, validateAndFormatJSON])

  const renderVisualization = () => {
    switch (topicName) {
      case "/scan":
        return <LidarView />
      case "/camera/image_raw":
        return <CameraView />
      default:
        return <div className="text-muted-foreground">No visualization available</div>
    }
  }

  if (loading) {
    return (
      <Card className="h-full w-full">
        <CardHeader className="pb-2">
          <CardTitle>{topicName}</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading topic data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!topicData) {
    return (
      <Card className="h-full w-full">
        <CardHeader className="pb-2">
          <CardTitle>{topicName}</CardTitle>
          <CardDescription>Error</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Failed to load topic data.</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg truncate">{topicName}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{topicData.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className={`w-full grid ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            {!isMobile && <TabsTrigger value="publish">Publish</TabsTrigger>}
            {!isMobile && <TabsTrigger value="visualization">Visualization</TabsTrigger>}
          </TabsList>

          {isMobile && (
            <TabsList className="w-full grid grid-cols-2 mt-1">
              <TabsTrigger value="publish">Publish</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="info">
            <div className="space-y-2">
              <p>
                <strong>Type:</strong> {topicData.type}
              </p>
              <p>
                <strong>Frequency:</strong> {topicData.frequency}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <ScrollArea className="max-h-[200px]">
              <pre className="bg-muted p-2 rounded text-sm font-mono overflow-auto">
                {topicData.data ? validateAndFormatJSON(JSON.stringify(topicData.data)) : "No data"}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="publish" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Message Data:</label>
                <Button variant="outline" size="sm" onClick={formatData}>
                  Format JSON
                </Button>
              </div>
              <Textarea
                value={publishData}
                onChange={(e) => setPublishData(e.target.value)}
                className="font-mono text-sm"
                rows={isMobile ? 3 : 5}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className={isMobile ? "space-y-2" : "flex items-end gap-4"}>
              <div className={isMobile ? "w-full" : "flex-1"}>
                <label className="text-sm font-medium">Publish Rate (Hz):</label>
                <Input
                  type="number"
                  value={publishRate}
                  onChange={(e) => setPublishRate(e.target.value)}
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div className={isMobile ? "grid grid-cols-2 gap-2 mt-2" : "flex items-center gap-2"}>
                <Button onClick={handlePublish} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Publish Once
                </Button>
                <Button onClick={toggleContinuousPublish} size="sm" variant={isPublishing ? "destructive" : "default"}>
                  {isPublishing ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPublishing ? "Stop" : "Start"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="min-h-[200px]">
            {renderVisualization()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
