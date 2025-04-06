"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CommandConsole() {
  const [command, setCommand] = useState("")
  const [output, setOutput] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock command execution
    setOutput((prev) => [...prev, `> ${command}`, `Executed command: ${command}`])
    setCommand("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command Console</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 overflow-y-auto mb-4 bg-gray-100 p-2 rounded">
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}

