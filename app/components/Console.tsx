"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Console() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setOutput((prev) => [...prev, `> ${input}`, `Executed command: ${input}`])
      setInput("")
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-1 mb-4">
        {output.map((line, index) => (
          <div key={index} className="font-mono text-sm">
            {line}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}

