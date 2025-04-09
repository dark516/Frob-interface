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
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProcessorLoad from "./ProcessorLoad"
import { memo, useState } from "react"

interface SidebarProps {
  createWindow: (type: "console" | "editor" | "topic" | "filesystem", topicName?: string) => void
  autoLayout: boolean
  onAutoLayoutChange: (value: boolean) => void
  isMobile?: boolean
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

export default memo(function Sidebar({ createWindow, autoLayout, onAutoLayoutChange, isMobile = false }: SidebarProps) {
  const [expandedTopics, setExpandedTopics] = useState(false)

  const toggleTopics = () => {
    setExpandedTopics(!expandedTopics)
  }

  return (
    <div
      className={`${isMobile ? "w-[85vw] max-w-[300px]" : "w-64"} h-full border-r border-border bg-card text-card-foreground p-4 flex flex-col overflow-auto`}
    >
      {isMobile && (
        <div className="mb-4 pb-2 border-b border-border">
          <h2 className="text-lg font-semibold">ROS2 Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome, admin</p>
        </div>
      )}

      {isMobile ? (
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="status">
            <AccordionTrigger className="py-2">Status</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-2">
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
                  <span className="text-red-500 text-sm">• disconnected</span>
                  <p className="text-xs text-muted-foreground mt-1">No connection to robot</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="nodes">
            <AccordionTrigger className="py-2">ROS Nodes</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm space-y-1 pl-2">
                {mockNodes.map((node) => (
                  <li key={node.name} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${node.status === "active" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    {node.name}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tools">
            <AccordionTrigger className="py-2">Tools</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => createWindow("filesystem")}
                >
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

                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-between" onClick={toggleTopics}>
                    <div className="flex items-center gap-2">
                      <LayoutListIcon className="h-4 w-4" />
                      <span>Topics</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedTopics ? "rotate-90" : ""}`} />
                  </Button>

                  {expandedTopics && (
                    <div className="pl-6 space-y-1">
                      {mockTopics.map((topic) => (
                        <Button
                          key={topic.name}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm h-8"
                          onClick={() => createWindow("topic", topic.name)}
                        >
                          {topic.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="settings">
            <AccordionTrigger className="py-2">Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-2">
                <Button
                  variant={autoLayout ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => onAutoLayoutChange(!autoLayout)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Auto Layout
                </Button>

                <Button variant="ghost" className="w-full justify-start gap-2 text-red-500">
                  Logout
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <>
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
              <span className="text-red-500 text-sm">• disconnected</span>
              <p className="text-xs text-muted-foreground mt-1">No connection to robot</p>
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
        </>
      )}
    </div>
  )
})
