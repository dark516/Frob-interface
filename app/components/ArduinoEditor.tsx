"use client"

import type React from "react"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { SaveIcon, UploadIcon, Code } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Dynamically import Monaco Editor with no SSR
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-muted">
      <div className="flex flex-col items-center gap-2">
        <Code className="h-8 w-8 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  ),
})

const initialCode = `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`

export default function ArduinoEditor() {
  const [code, setCode] = useState(initialCode)
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)

  // Check if we're in a browser environment and if Monaco might have issues
  useEffect(() => {
    // Try to load Monaco, but fall back to simple editor if it fails
    const checkMonacoAvailability = async () => {
      try {
        await import("@monaco-editor/react")
        setUseSimpleEditor(false)
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error)
        setUseSimpleEditor(true)
      }
    }

    checkMonacoAvailability()
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm">
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {useSimpleEditor ? (
          <Textarea
            value={code}
            onChange={handleTextareaChange}
            className="h-full font-mono text-sm resize-none p-4"
            placeholder="Enter Arduino code here..."
          />
        ) : (
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  )
}
