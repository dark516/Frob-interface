"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function ArduinoProgramming() {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")

  const handleCompile = () => {
    // Mock compilation process
    setOutput("Compiling...\nCompilation successful!")
  }

  const handleUpload = () => {
    // Mock upload process
    setOutput("Uploading...\nUpload successful!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arduino Programming</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-40 p-2 mb-4 font-mono text-sm"
          placeholder="Enter Arduino code here..."
        />
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleCompile}>Compile</Button>
          <Button onClick={handleUpload}>Upload</Button>
        </div>
        <div className="bg-gray-100 p-2 rounded">
          <pre>{output}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
