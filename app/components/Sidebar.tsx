"use client"

import {
  BatteryIcon,
  WifiIcon,
  CircuitBoardIcon,
  TerminalIcon,
  CodeIcon,
  LayoutListIcon,
  LayoutGrid,
  FolderIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ProcessorLoad from "./ProcessorLoad"
import { memo } from "react"

interface SidebarProps {
  createWindow: (type: "console" | "editor" | "topic" | "filesystem", topicName?: string) => void
  autoLayout: boolean
  onAutoLayoutChange: (value: boolean) => void
}

const mockNodes = [
  { name: "/robot_state_publisher", status: "active" },
  { name: "/controller_manager", status: "active" },
  { name: "/lidar_node", status: "active" },
  { name: "/camera_node", status: "warning" },
]

const mockTopics = [
  { name: "/cmd_vel", type: "geometry_msgs/Twist" },
  { name: "/battery_state", type: "sensor_msgs/BatteryState" },
  { name: "/joint_states", type: "sensor_msgs/JointState" },
  { name: "/camera/image_raw", type: "sensor_msgs/Image" },
  { name: "/scan", type: "sensor_msgs/LaserScan" },
]

export default memo(function Sidebar({ createWindow, autoLayout, onAutoLayoutChange }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card text-card-foreground p-4 flex flex-col">
      <div className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium mb-2">
            <BatteryIcon className="h-4 w-4" />
            Battery Status
          </h2>
          <div className="bg-secondary h-2 rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: "76.9%" }} />
          </div>
          <span className="text-sm text-muted-foreground">76.9%</span>
        </div>

        <ProcessorLoad />

        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium mb-2">
            <WifiIcon className="h-4 w-4" />
            Connection Status
          </h2>
          <span className="text-green-500 text-sm">• connected</span>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium mb-2">
            <CircuitBoardIcon className="h-4 w-4" />
            ROS Nodes
          </h2>
          <ul className="text-sm space-y-1">
            {mockNodes.map((node) => (
              <li key={node.name} className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${node.status === "active" ? "bg-green-500" : "bg-yellow-500"}`}
                />
                {node.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <Separator className="my-4" />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => createWindow("filesystem")}>
          <FolderIcon className="h-4 w-4" />
          File System
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => createWindow("console")}>
          <TerminalIcon className="h-4 w-4" />
          New Console
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => createWindow("editor")}>
          <CodeIcon className="h-4 w-4" />
          New Editor
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutListIcon className="h-4 w-4" />
              Open Topic
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {mockTopics.map((topic) => (
              <DropdownMenuItem key={topic.name} onSelect={() => createWindow("topic", topic.name)}>
                {topic.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator className="my-4" />

        <Button
          variant={autoLayout ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => onAutoLayoutChange(!autoLayout)}
        >
          <LayoutGrid className="h-4 w-4" />
          Auto Layout
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-4">Last updated: 12:03:43 PM</div>
    </div>
  )
})

