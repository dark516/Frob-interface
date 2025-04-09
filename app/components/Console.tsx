"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ConsoleMessage {
  type: "input" | "output" | "error"
  content: string
  timestamp: number
}

export default function Console({ initialDirectory = "/" }) {
  // Modify the Console component to show no connection status
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    {
      type: "error",
      content: "Not connected to robot. Commands cannot be executed.",
      timestamp: Date.now(),
    },
    {
      type: "output",
      content: "This is a simulation of the console. No actual robot connection is available.",
      timestamp: Date.now(),
    },
  ])

  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set connection status to false
    setIsConnected(false)

    // No need to subscribe to websocket events
    return () => {
      // No cleanup needed
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newMessage: ConsoleMessage = {
        type: "input",
        content: input,
        timestamp: Date.now(),
      }
      setMessages((prev) => [
        ...prev,
        newMessage,
        {
          type: "error",
          content: "Cannot execute command: No connection to robot",
          timestamp: Date.now(),
        },
      ])

      setInput("")
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`font-mono text-sm mb-1 ${
              message.type === "error" ? "text-red-500" : message.type === "input" ? "text-blue-500" : ""
            }`}
          >
            {message.type === "input" ? "> " : ""}
            {message.content}
          </div>
        ))}
        {!isConnected && (
          <div className="text-yellow-500 font-mono text-sm">Warning: Not connected to robot console</div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 font-mono"
        />
        <Button type="submit" disabled={!isConnected}>
          Send
        </Button>
      </form>
    </div>
  )
}
