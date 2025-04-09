"use client"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Layout from "./Layout"
import TopicList from "./TopicList"
import CommandConsole from "./CommandConsole"
import ArduinoProgramming from "./ArduinoProgramming"
import RobotStatus from "./RobotStatus"

export default function Dashboard() {
  const [layout, setLayout] = useState([
    { i: "topics", x: 0, y: 0, w: 6, h: 8 },
    { i: "console", x: 6, y: 0, w: 6, h: 4 },
    { i: "arduino", x: 6, y: 4, w: 6, h: 4 },
    { i: "status", x: 0, y: 8, w: 12, h: 2 },
  ])

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">ROS2 Robot Dashboard</h1>
        <Layout layout={layout} onLayoutChange={onLayoutChange}>
          <div key="topics">
            <TopicList />
          </div>
          <div key="console">
            <CommandConsole />
          </div>
          <div key="arduino">
            <ArduinoProgramming />
          </div>
          <div key="status">
            <RobotStatus />
          </div>
        </Layout>
      </div>
    </DndProvider>
  )
}
