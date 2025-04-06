"use client"

import { useState, useCallback, forwardRef, useImperativeHandle, useEffect, useRef } from "react"
import { Rnd } from "react-rnd"
import { X, Minus, Edit2, Check } from "lucide-react"
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
}

const MIN_WINDOW_WIDTH = 400
const MIN_WINDOW_HEIGHT = 300
const WINDOW_MARGIN = 20
const MINIMIZED_HEIGHT = 40

const WindowManager = forwardRef<any, WindowManagerProps>(({ autoLayout }, ref) => {
  const [windows, setWindows] = useState<Window[]>([])
  const [nextId, setNextId] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoLayoutRef = useRef(autoLayout)
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null)

  useEffect(() => {
    autoLayoutRef.current = autoLayout
    if (autoLayout) {
      updateAutoLayout()
    }
  }, [autoLayout])

  const calculateInitialPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const grid = 50
    let x = WINDOW_MARGIN
    let y = WINDOW_MARGIN

    const offset = (windows.length * grid) % (Math.min(containerWidth, containerHeight) / 2)
    x = (WINDOW_MARGIN + offset) % (containerWidth - MIN_WINDOW_WIDTH - WINDOW_MARGIN)
    y = (WINDOW_MARGIN + offset) % (containerHeight - MIN_WINDOW_HEIGHT - WINDOW_MARGIN)

    return { x, y }
  }, [windows.length])

  const updateAutoLayout = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const visibleWindows = windows.filter((w) => !w.isMinimized)
    if (visibleWindows.length === 0) return

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
        }
      }),
    )
  }, [windows])

  const createWindow = useCallback(
    (type: WindowType, pathOrName?: string, content = "") => {
      const { x, y } = calculateInitialPosition()

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
          width: MIN_WINDOW_WIDTH,
          height: MIN_WINDOW_HEIGHT,
          isMinimized: false,
          zIndex: newMaxZIndex,
          topicName: type === "topic" ? pathOrName : undefined,
          filePath: ["editor", "arduino"].includes(type) ? pathOrName : undefined,
          fileContent: content,
        }
        setNextId((n) => n + 1)
        return [...prev, newWindow]
      })
    },
    [calculateInitialPosition, nextId],
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
  }, [])

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id !== id) return window

        if (window.isMinimized) {
          return {
            ...window,
            isMinimized: false,
            height: window.savedDimensions?.height ?? MIN_WINDOW_HEIGHT,
            width: window.savedDimensions?.width ?? MIN_WINDOW_WIDTH,
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
          width: MIN_WINDOW_WIDTH,
        }
      }),
    )
  }, [])

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
          minWidth={MIN_WINDOW_WIDTH}
          minHeight={window.isMinimized ? MINIMIZED_HEIGHT : MIN_WINDOW_HEIGHT}
          bounds="parent"
          style={{ zIndex: window.zIndex }}
          onDragStop={(e, d) => {
            setWindows((prev) => prev.map((w) => (w.id === window.id ? { ...w, x: d.x, y: d.y } : w)))
          }}
          onResize={(e, direction, ref, delta, position) => {
            handleResize(window.id, ref, position)
          }}
          enableResizing={!window.isMinimized}
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
              <div className="flex items-center gap-2">
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
                  <h3 className="text-sm font-semibold">{window.title}</h3>
                )}
                {editingWindowId === window.id ? (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={finishEditing}>
                    <Check className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditing(window.id)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMinimize(window.id)}>
                  <Minus className="h-4 w-4" />
                </Button>
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
                />
              ) : window.type === "arduino" ? (
                <TextEditor
                  filePath={window.filePath}
                  content={window.fileContent || ""}
                  isArduino
                  onSave={handleFileSave}
                  fileSystem={windows.find((w) => w.type === "filesystem")?.fileSystem || []}
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
                />
              ) : window.type === "terminal" ? (
                <Console initialDirectory={window.filePath} />
              ) : (
                <TopicWindow topicName={window.topicName!} />
              )}
            </div>
          </div>
        </Rnd>
      ))}
    </div>
  )
})

WindowManager.displayName = "WindowManager"

export default WindowManager

