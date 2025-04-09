"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "./theme-provider"

interface NavbarProps {
  toggleSidebar?: () => void
  isMobile?: boolean
}

export default function Navbar({ toggleSidebar, isMobile = false }: NavbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <nav className="flex items-center justify-between px-4 h-14 border-b border-border bg-background text-foreground sticky top-0 z-20">
      <div className="flex items-center">
        {isMobile && toggleSidebar && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">ROS2 Web Interface</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {!isMobile && (
          <>
            <span>Welcome, admin</span>
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
