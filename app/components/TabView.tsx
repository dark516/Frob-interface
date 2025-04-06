"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import LidarView from "./visualizations/LidarView"
import CameraView from "./visualizations/CameraView"

export default function TabView() {
  return (
    <Tabs defaultValue="lidar" className="w-full h-full">
      <div className="border-b border-border">
        <TabsList className="p-0 h-12 bg-transparent border-b border-border rounded-none">
          <TabsTrigger value="lidar" className="data-[state=active]:bg-background rounded-none h-12 px-4">
            LiDAR View
          </TabsTrigger>
          <TabsTrigger value="camera" className="data-[state=active]:bg-background rounded-none h-12 px-4">
            Camera Feed
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="lidar" className="h-[calc(100%-3rem)] m-0">
        <LidarView />
      </TabsContent>

      <TabsContent value="camera" className="h-[calc(100%-3rem)] m-0">
        <CameraView />
      </TabsContent>
    </Tabs>
  )
}

