"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { SaveIcon, UploadIcon } from "lucide-react"

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

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value)
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
      </div>
    </div>
  )
}

