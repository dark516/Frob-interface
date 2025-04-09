"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MoreVertical, Maximize2, Minimize2, WifiIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LidarView from "./visualizations/LidarView"
import CameraView from "./visualizations/CameraView"

const mockTopics = [
  {
    name: "/cmd_vel",
    type: "geometry_msgs/Twist",
    frequency: "10 Hz",
    data: '{ "linear": { "x": 0, "y": 0, "z": 0 }, "angular": { "x": 0, "y": 0, "z": 0 } }',
  },
  {
    name: "/battery_state",
    type: "sensor_msgs/BatteryState",
    frequency: "1 Hz",
    data: '{ "percentage": 75, "voltage": 12.5 }',
  },
  {
    name: "/joint_states",
    type: "sensor_msgs/JointState",
    frequency: "50 Hz",
    data: '{ "position": [ 0, 0, 0 ], "velocity": [ 0, 0, 0 ] }',
  },
  {
    name: "/camera/image_raw",
    type: "sensor_msgs/Image",
    frequency: "30 Hz",
    data: '{ "width": 640, "height": 480, "encoding": "rgb8" }',
  },
  {
    name: "/scan",
    type: "sensor_msgs/LaserScan",
    frequency: "40 Hz",
    data: '{ "ranges": [1.0, 1.5, 2.0, 2.5, 3.0], "angle_min": -3.14, "angle_max": 3.14, "angle_increment": 0.01 }',
  },
]

export default function TopicList() {
  const [filter, setFilter] = useState("")
  const [expandedTopics, setExpandedTopics] = useState<string[]>([])
  const [tileOrder, setTileOrder] = useState(mockTopics.map((_, index) => index))
  const [tileSizes, setTileSizes] = useState(mockTopics.map(() => 1))
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const filteredTopics = mockTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(filter.toLowerCase()) ||
      topic.type.toLowerCase().includes(filter.toLowerCase()),
  )

  const toggleTopic = (topicName: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((name) => name !== topicName) : [...prev, topicName],
    )
  }

  const renderVisualization = (topic: (typeof mockTopics)[0]) => {
    switch (topic.name) {
      case "/scan":
        return <LidarView />
      case "/camera/image_raw":
        return <CameraView />
      default:
        return <div className="text-muted-foreground">No visualization available</div>
    }
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newOrder = [...tileOrder]
      const draggedItemContent = newOrder[dragItem.current]
      newOrder.splice(dragItem.current, 1)
      newOrder.splice(dragOverItem.current, 0, draggedItemContent)
      setTileOrder(newOrder)
    }
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleResize = (index: number) => {
    const newSizes = [...tileSizes]
    newSizes[index] = newSizes[index] === 1 ? 2 : 1
    setTileSizes(newSizes)
  }

  // Add a no connection message to the TopicList component
  return (
    <div className="space-y-4 p-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
        <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
          <WifiIcon className="h-4 w-4 mr-2" />
          Not connected to robot. Topic data is simulated.
        </p>
      </div>
      <Input type="text" placeholder="Filter topics..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tileOrder.map((orderIndex) => {
          const topic = filteredTopics[orderIndex]
          if (!topic) return null
          return (
            <div
              key={topic.name}
              className={`bg-card rounded-lg shadow-md overflow-hidden ${
                tileSizes[orderIndex] === 2 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
              draggable
              onDragStart={() => handleDragStart(orderIndex)}
              onDragEnter={() => handleDragEnter(orderIndex)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="p-4 cursor-pointer flex justify-between items-center">
                <h3 className="font-semibold">{topic.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleResize(orderIndex)}>
                    {tileSizes[orderIndex] === 1 ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleTopic(topic.name)}>
                        {expandedTopics.includes(topic.name) ? "Collapse" : "Expand"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {expandedTopics.includes(topic.name) && (
                <div className="p-4 border-t border-border">
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="data">Data</TabsTrigger>
                      <TabsTrigger value="visualization">Visualization</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-4">
                      <div className="space-y-2">
                        <p>
                          <strong>Type:</strong> {topic.type}
                        </p>
                        <p>
                          <strong>Frequency:</strong> {topic.frequency}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="data" className="mt-4">
                      <pre className="bg-muted p-2 rounded text-sm font-mono overflow-auto max-h-48">{topic.data}</pre>
                    </TabsContent>
                    <TabsContent value="visualization" className="mt-4">
                      {renderVisualization(topic)}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
