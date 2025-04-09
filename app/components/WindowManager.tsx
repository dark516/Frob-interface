"use client"

import { useState, useCallback, forwardRef, useImperativeHandle, useEffect, useRef } from "react"
import { Rnd } from "react-rnd"
import { X, Minus, Edit2, Check, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Console from "./Console"
import TopicWindow from "./TopicWindow"
import FileSystem from "./FileSystem"
import TextEditor from "./TextEditor"

type WindowType = "console" | "editor" | "topic" | "filesystem" | "terminal" | "arduino"

interface Window {
  id: string
  type: WindowType
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  topicName?: string
  savedDimensions?: {
    x: number
    y: number
    width: number
    height: number
  }
  filePath?: string
  fileContent?: string
}

interface WindowManagerProps {
  autoLayout: boolean
  isMobile?: boolean
}

const MIN_WINDOW_WIDTH = 400
const MIN_WINDOW_HEIGHT = 300
const WINDOW_MARGIN = 20
const MINIMIZED_HEIGHT = 40
const MOBILE_MIN_WINDOW_WIDTH = 300
const MOBILE_MIN_WINDOW_HEIGHT = 200

const WindowManager = forwardRef<any, WindowManagerProps>(({ autoLayout, isMobile = false }, ref) => {
  const [windows, setWindows] = useState<Window[]>([])
  const [nextId, setNextId] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoLayoutRef = useRef(autoLayout)
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null)
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([])

  useEffect(() => {
    autoLayoutRef.current = autoLayout
    if (autoLayout) {
      updateAutoLayout()
    }
  }, [autoLayout])

  // Adjust window sizes when switching between mobile and desktop
  useEffect(() => {
    if (windows.length > 0) {
      setWindows((prev) =>
        prev.map((window) => {
          // If on mobile, ensure windows fit within the screen
          if (isMobile) {
            const newWidth = Math.min(
              window.width,
              window.isMaximized
                ? window.width
                : Math.min(
                    window.width,
                    window.width > MOBILE_MIN_WINDOW_WIDTH ? window.width : MOBILE_MIN_WINDOW_WIDTH,
                  ),
            )
            const newHeight = Math.min(
              window.height,
              window.isMaximized
                ? window.height
                : Math.min(
                    window.height,
                    window.height > MOBILE_MIN_WINDOW_HEIGHT ? window.height : MOBILE_MIN_WINDOW_HEIGHT,
                  ),
            )

            return {
              ...window,
              width: newWidth,
              height: newHeight,
              // Center window if it's the only one
              x: prev.length === 1 ? (containerRef.current?.clientWidth || 0) / 2 - newWidth / 2 : window.x,
              y: prev.length === 1 ? (containerRef.current?.clientHeight || 0) / 2 - newHeight / 2 : window.y,
            }
          }
          return window
        }),
      )
    }
  }, [isMobile, windows.length])

  const calculateInitialPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // For mobile, center the window
    if (isMobile) {
      const width = Math.min(containerWidth - 2 * WINDOW_MARGIN, MOBILE_MIN_WINDOW_WIDTH)
      const height = Math.min(containerHeight - 2 * WINDOW_MARGIN, MOBILE_MIN_WINDOW_HEIGHT)

      return {
        x: (containerWidth - width) / 2,
        y: (containerHeight - height) / 2,
      }
    }

    // For desktop, use the cascading effect
    const grid = 50
    let x = WINDOW_MARGIN
    let y = WINDOW_MARGIN

    const offset = (windows.length * grid) % (Math.min(containerWidth, containerHeight) / 2)
    x =
      (WINDOW_MARGIN + offset) %
      (containerWidth - (isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH) - WINDOW_MARGIN)
    y =
      (WINDOW_MARGIN + offset) %
      (containerHeight - (isMobile ? MOBILE_MIN_WINDOW_HEIGHT : MIN_WINDOW_HEIGHT) - WINDOW_MARGIN)

    return { x, y }
  }, [windows.length, isMobile])

  const updateAutoLayout = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const visibleWindows = windows.filter((w) => !w.isMinimized)
    if (visibleWindows.length === 0) return

    // For mobile, stack windows vertically
    if (isMobile) {
      const windowHeight = Math.floor(
        (containerHeight - WINDOW_MARGIN * (visibleWindows.length + 1)) / visibleWindows.length,
      )
      const windowWidth = containerWidth - 2 * WINDOW_MARGIN

      setWindows((prev) =>
        prev.map((window, index) => {
          if (window.isMinimized) return window

          const visibleIndex = visibleWindows.findIndex((w) => w.id === window.id)
          if (visibleIndex === -1) return window

          return {
            ...window,
            x: WINDOW_MARGIN,
            y: WINDOW_MARGIN + visibleIndex * (windowHeight + WINDOW_MARGIN),
            width: windowWidth,
            height: windowHeight,
            isMaximized: false,
          }
        }),
      )
      return
    }

    // For desktop, use grid layout
    const cols = Math.ceil(Math.sqrt(visibleWindows.length))
    const rows = Math.ceil(visibleWindows.length / cols)

    const windowWidth = Math.floor((containerWidth - WINDOW_MARGIN * (cols + 1)) / cols)
    const windowHeight = Math.floor((containerHeight - WINDOW_MARGIN * (rows + 1)) / rows)

    setWindows((prev) =>
      prev.map((window) => {
        if (window.isMinimized) return window

        const index = visibleWindows.findIndex((w) => w.id === window.id)
        if (index === -1) return window

        const col = index % cols
        const row = Math.floor(index / cols)

        return {
          ...window,
          x: WINDOW_MARGIN + col * (windowWidth + WINDOW_MARGIN),
          y: WINDOW_MARGIN + row * (windowHeight + WINDOW_MARGIN),
          width: windowWidth,
          height: windowHeight,
          isMaximized: false,
        }
      }),
    )
  }, [windows, isMobile])

  const createWindow = useCallback(
    (type: WindowType, pathOrName?: string, content = "") => {
      const { x, y } = calculateInitialPosition()
      const minWidth = isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH
      const minHeight = isMobile ? MOBILE_MIN_WINDOW_HEIGHT : MIN_WINDOW_HEIGHT

      setWindows((prev) => {
        const newMaxZIndex = Math.max(...prev.map((w) => w.zIndex), 0) + 1
        const newWindow: Window = {
          id: `window-${nextId}`,
          type,
          title:
            type === "console"
              ? `Console ${nextId}`
              : type === "editor"
                ? `Editor: ${pathOrName || "Untitled"}`
                : type === "arduino"
                  ? `Arduino: ${pathOrName || "Untitled"}`
                  : type === "terminal"
                    ? `Terminal: ${pathOrName || "/"}`
                    : type === "filesystem"
                      ? "File System"
                      : `Topic: ${pathOrName}`,
          x,
          y,
          width: minWidth,
          height: minHeight,
          isMinimized: false,
          isMaximized: isMobile, // Maximize by default on mobile
          zIndex: newMaxZIndex,
          topicName: type === "topic" ? pathOrName : undefined,
          filePath: ["editor", "arduino"].includes(type) ? pathOrName : undefined,
          fileContent: content,
        }
        setNextId((n) => n + 1)
        return [...prev, newWindow]
      })

      // Show notification for console and topic windows
      if (type === "console" || type === "topic") {
        console.log("Note: No connection to robot. Data is simulated.")
      }
    },
    [calculateInitialPosition, nextId, isMobile],
  )

  useImperativeHandle(
    ref,
    () => ({
      createWindow: createWindow,
    }),
    [createWindow],
  )

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const newMaxZIndex = Math.max(...prev.map((w) => w.zIndex)) + 1
      return prev.map((window) => (window.id === id ? { ...window, zIndex: newMaxZIndex } : window))
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id))
    setMinimizedWindows((prev) => prev.filter((windowId) => windowId !== id))
  }, [])

  const toggleMinimize = useCallback(
    (id: string) => {
      setWindows((prev) =>
        prev.map((window) => {
          if (window.id !== id) return window

          if (window.isMinimized) {
            return {
              ...window,
              isMinimized: false,
              height: window.savedDimensions?.height ?? (isMobile ? MOBILE_MIN_WINDOW_HEIGHT : MIN_WINDOW_HEIGHT),
              width: window.savedDimensions?.width ?? (isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH),
              x: window.savedDimensions?.x ?? window.x,
              y: window.savedDimensions?.y ?? window.y,
            }
          }

          return {
            ...window,
            isMinimized: true,
            savedDimensions: {
              x: window.x,
              y: window.y,
              width: window.width,
              height: window.height,
            },
            height: MINIMIZED_HEIGHT,
            width: isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH,
          }
        }),
      )

      setMinimizedWindows((prev) => {
        if (prev.includes(id)) {
          return prev.filter((windowId) => windowId !== id)
        } else {
          return [...prev, id]
        }
      })
    },
    [isMobile],
  )

  const toggleMaximize = useCallback(
    (id: string) => {
      if (!containerRef.current) return

      const container = containerRef.current

      setWindows((prev) =>
        prev.map((window) => {
          if (window.id !== id) return window

          if (window.isMaximized) {
            return {
              ...window,
              isMaximized: false,
              x: window.savedDimensions?.x ?? window.x,
              y: window.savedDimensions?.y ?? window.y,
              width: window.savedDimensions?.width ?? (isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH),
              height: window.savedDimensions?.height ?? (isMobile ? MOBILE_MIN_WINDOW_HEIGHT : MIN_WINDOW_HEIGHT),
            }
          }

          // Maximize window
          return {
            ...window,
            isMaximized: true,
            savedDimensions: {
              x: window.x,
              y: window.y,
              width: window.width,
              height: window.height,
            },
            x: 0,
            y: 0,
            width: container.clientWidth,
            height: container.clientHeight,
          }
        }),
      )
    },
    [isMobile],
  )

  const handleResize = useCallback((id: string, ref: HTMLElement, position: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id !== id) return window
        return {
          ...window,
          width: Number.parseInt(ref.style.width),
          height: Number.parseInt(ref.style.height),
          x: position.x,
          y: position.y,
          isMaximized: false,
        }
      }),
    )
  }, [])

  const startEditing = useCallback((id: string) => {
    setEditingWindowId(id)
  }, [])

  const finishEditing = useCallback(() => {
    setEditingWindowId(null)
  }, [])

  const updateTitle = useCallback((id: string, newTitle: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id !== id) return window
        return {
          ...window,
          title: newTitle,
        }
      }),
    )
  }, [])

  const handleFileSave = useCallback(
    (path: string, content: string) => {
      // Find the FileSystem window
      const fileSystemWindow = windows.find((w) => w.type === "filesystem")
      if (!fileSystemWindow) {
        // If no FileSystem window exists, create one
        createWindow("filesystem")
      }

      // Update the file content in all relevant windows
      setWindows((prev) =>
        prev.map((window) => {
          if ((window.type === "editor" || window.type === "arduino") && window.filePath === path) {
            return {
              ...window,
              fileContent: content,
            }
          }
          return window
        }),
      )

      // Find all FileSystem windows and update their state
      const fileSystemWindows = windows.filter((w) => w.type === "filesystem")
      fileSystemWindows.forEach((window) => {
        if (window.ref?.current?.handleFileSave) {
          window.ref.current.handleFileSave(path, content)
        }
      })
    },
    [windows, createWindow],
  )

  // Render minimized windows bar at the bottom
  const renderMinimizedWindows = () => {
    if (minimizedWindows.length === 0) return null

    return (
      <div className="fixed bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1 bg-background border-t border-border z-10">
        {windows
          .filter((w) => minimizedWindows.includes(w.id))
          .map((window) => (
            <Button
              key={window.id}
              variant="outline"
              size="sm"
              className="text-xs truncate max-w-[150px]"
              onClick={() => toggleMinimize(window.id)}
            >
              {window.title}
            </Button>
          ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      {windows.map((window) => (
        <Rnd
          key={window.id}
          default={{
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height,
          }}
          size={{ width: window.width, height: window.isMinimized ? MINIMIZED_HEIGHT : window.height }}
          position={{ x: window.x, y: window.y }}
          minWidth={isMobile ? MOBILE_MIN_WINDOW_WIDTH : MIN_WINDOW_WIDTH}
          minHeight={window.isMinimized ? MINIMIZED_HEIGHT : isMobile ? MOBILE_MIN_WINDOW_HEIGHT : MIN_WINDOW_HEIGHT}
          bounds="parent"
          style={{ zIndex: window.zIndex }}
          onDragStop={(e, d) => {
            setWindows((prev) =>
              prev.map((w) => (w.id === window.id ? { ...w, x: d.x, y: d.y, isMaximized: false } : w)),
            )
          }}
          onResize={(e, direction, ref, delta, position) => {
            handleResize(window.id, ref, position)
          }}
          enableResizing={!window.isMinimized && !window.isMaximized}
          disableDragging={window.isMaximized}
          onMouseDown={() => bringToFront(window.id)}
          resizeHandleClasses={{
            bottom: "h-2 cursor-row-resize",
            bottomLeft: "h-2 w-2 cursor-sw-resize",
            bottomRight: "h-2 w-2 cursor-se-resize",
            left: "w-2 cursor-col-resize",
            right: "w-2 cursor-col-resize",
            top: "h-2 cursor-row-resize",
            topLeft: "h-2 w-2 cursor-nw-resize",
            topRight: "h-2 w-2 cursor-ne-resize",
          }}
        >
          <div
            className={cn(
              "flex flex-col border rounded-lg shadow-lg bg-card text-card-foreground overflow-hidden",
              "transition-all duration-200",
              window.isMinimized ? "h-10" : "h-full",
            )}
          >
            <div className="flex items-center justify-between p-2 bg-muted">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {editingWindowId === window.id ? (
                  <Input
                    type="text"
                    value={window.title}
                    onChange={(e) => updateTitle(window.id, e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        finishEditing()
                      }
                    }}
                    autoFocus
                    className="text-sm font-semibold"
                  />
                ) : (
                  <h3 className="text-sm font-semibold truncate">{window.title}</h3>
                )}
                {editingWindowId === window.id ? (
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={finishEditing}>
                    <Check className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => startEditing(window.id)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMinimize(window.id)}>
                  <Minus className="h-4 w-4" />
                </Button>
                {!window.isMinimized && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMaximize(window.id)}>
                    {window.isMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closeWindow(window.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div
              className={cn(
                "flex-1 overflow-auto transition-all duration-200",
                window.isMinimized ? "hidden" : "block",
              )}
            >
              {window.type === "console" ? (
                <Console />
              ) : window.type === "editor" ? (
                <TextEditor
                  filePath={window.filePath}
                  content={window.fileContent || ""}
                  onSave={handleFileSave}
                  fileSystem={windows.find((w) => w.type === "filesystem")?.fileSystem || []}
                  isMobile={isMobile}
                />
              ) : window.type === "arduino" ? (
                <TextEditor
                  filePath={window.filePath}
                  content={window.fileContent || ""}
                  isArduino
                  onSave={handleFileSave}
                  fileSystem={windows.find((w) => w.type === "filesystem")?.fileSystem || []}
                  isMobile={isMobile}
                />
              ) : window.type === "filesystem" ? (
                <FileSystem
                  onOpenFile={(file, type) => {
                    createWindow(type === "arduino" ? "arduino" : "editor", file.path, file.content)
                  }}
                  onOpenTerminal={(path) => {
                    createWindow("terminal", path)
                  }}
                  onSaveFile={handleFileSave}
                  isMobile={isMobile}
                />
              ) : window.type === "terminal" ? (
                <Console initialDirectory={window.filePath} />
              ) : (
                <TopicWindow topicName={window.topicName!} isMobile={isMobile} />
              )}
            </div>
          </div>
        </Rnd>
      ))}

      {!isMobile && renderMinimizedWindows()}
    </div>
  )
})

WindowManager.displayName = "WindowManager"

export default WindowManager
