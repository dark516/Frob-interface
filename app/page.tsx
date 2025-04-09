"use client"

import { useRef, useCallback, useState } from "react"
import Sidebar from "./components/Sidebar"
import WindowManager from "./components/WindowManager"
import Navbar from "./components/Navbar"
import { ThemeProvider } from "./components/theme-provider"
import useMobile from "./hooks/use-mobile"
import MobileNav from "./components/MobileNav"

export default function Home() {
  const windowManagerRef = useRef(null)
  const [autoLayout, setAutoLayout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  const handleCreateWindow = useCallback(
    (type: "console" | "editor" | "topic" | "filesystem", topicName?: string) => {
      if (windowManagerRef?.current?.createWindow) {
        windowManagerRef.current.createWindow(type, topicName)
        // Close sidebar on mobile after creating a window
        if (isMobile) {
          setSidebarOpen(false)
        }
      }
    },
    [isMobile],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <div className="flex-1 flex relative">
          {/* Sidebar with mobile overlay mode */}
          <div
            className={`${isMobile ? "fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform" : "relative"} 
                       ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
          >
            <Sidebar
              createWindow={handleCreateWindow}
              autoLayout={autoLayout}
              onAutoLayoutChange={setAutoLayout}
              isMobile={isMobile}
            />
          </div>

          {/* Backdrop for mobile sidebar */}
          {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={toggleSidebar} />}

          <div className="flex-1 relative">
            <WindowManager ref={windowManagerRef} autoLayout={autoLayout} isMobile={isMobile} />
          </div>
        </div>

        {/* Mobile bottom navigation */}
        {isMobile && <MobileNav createWindow={handleCreateWindow} />}
      </div>
    </ThemeProvider>
  )
}
