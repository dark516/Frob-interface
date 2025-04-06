"use client"

import { useRef, useCallback, useState } from "react"
import Sidebar from "./components/Sidebar"
import WindowManager from "./components/WindowManager"
import Navbar from "./components/Navbar"
import { ThemeProvider } from "./components/theme-provider"

export default function Home() {
  const windowManagerRef = useRef(null)
  const [autoLayout, setAutoLayout] = useState(false)

  const handleCreateWindow = useCallback((type: "console" | "editor" | "topic", topicName?: string) => {
    if (windowManagerRef?.current?.createWindow) {
      windowManagerRef.current.createWindow(type, topicName)
    }
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar createWindow={handleCreateWindow} autoLayout={autoLayout} onAutoLayoutChange={setAutoLayout} />
          <div className="flex-1 relative">
            <WindowManager ref={windowManagerRef} autoLayout={autoLayout} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

