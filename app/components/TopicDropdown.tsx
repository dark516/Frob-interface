"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const mockTopics = [
  { name: "/cmd_vel", type: "geometry_msgs/Twist" },
  { name: "/battery_state", type: "sensor_msgs/BatteryState" },
  { name: "/joint_states", type: "sensor_msgs/JointState" },
  { name: "/camera/image_raw", type: "sensor_msgs/Image" },
  { name: "/scan", type: "sensor_msgs/LaserScan" },
]

interface TopicDropdownProps {
  createTopicWindow: (type: "topic", topicName: string) => void
}

export default function TopicDropdown({ createTopicWindow }: TopicDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="absolute top-4 left-4 z-10">
          Topics <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {mockTopics.map((topic) => (
          <DropdownMenuItem
            key={topic.name}
            onSelect={() => {
              createTopicWindow("topic", topic.name)
              setOpen(false)
            }}
          >
            {topic.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

