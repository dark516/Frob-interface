"use client"

import { Terminal, Code, Folder, List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  createWindow: (type: "console" | "editor" | "topic" | "filesystem", topicName?: string) => void
}

export default function MobileNav({ createWindow }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-2 z-20">
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-14 w-full"
        onClick={() => createWindow("console")}
      >
        <Terminal className="h-5 w-5 mb-1" />
        <span className="text-xs">Console</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-14 w-full"
        onClick={() => createWindow("editor")}
      >
        <Code className="h-5 w-5 mb-1" />
        <span className="text-xs">Editor</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-14 w-full"
        onClick={() => createWindow("filesystem")}
      >
        <Folder className="h-5 w-5 mb-1" />
        <span className="text-xs">Files</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-14 w-full"
        onClick={() => createWindow("topic", "/cmd_vel")}
      >
        <List className="h-5 w-5 mb-1" />
        <span className="text-xs">Topics</span>
      </Button>
    </div>
  )
}
