"use client"

import type React from "react"

import { useState } from "react"
import { Folder, File, Upload, Edit2, Trash2, ChevronRight, Plus, Move, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface FileSystemItem {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  children?: FileSystemItem[]
  path: string
}

const mockFileSystem: FileSystemItem[] = [
  {
    id: "1",
    name: "config",
    type: "directory",
    path: "/config",
    children: [
      {
        id: "2",
        name: "robot_params.yaml",
        type: "file",
        content: "robot_name: my_robot\nmax_velocity: 1.0\nmax_acceleration: 0.5",
        path: "/config/robot_params.yaml",
      },
      {
        id: "3",
        name: "navigation.yaml",
        type: "file",
        content: "map_file: map.pgm\nbase_frame: base_link\nodom_frame: odom",
        path: "/config/navigation.yaml",
      },
    ],
  },
  {
    id: "4",
    name: "maps",
    type: "directory",
    path: "/maps",
    children: [
      {
        id: "5",
        name: "lab_map.pgm",
        type: "file",
        content: "Binary map data...",
        path: "/maps/lab_map.pgm",
      },
    ],
  },
  {
    id: "6",
    name: "arduino",
    type: "directory",
    path: "/arduino",
    children: [
      {
        id: "7",
        name: "robot_controller.ino",
        type: "file",
        content: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`,
        path: "/arduino/robot_controller.ino",
      },
    ],
  },
  {
    id: "8",
    name: "scripts",
    type: "directory",
    path: "/scripts",
    children: [
      {
        id: "9",
        name: "startup.sh",
        type: "file",
        content: "#!/bin/bash\nros2 launch robot_bringup main.launch.py",
        path: "/scripts/startup.sh",
      },
    ],
  },
]

interface FileSystemProps {
  onOpenFile: (file: FileSystemItem, type: "text" | "arduino") => void
  onOpenTerminal: (path: string) => void
  onSaveFile?: (path: string, content: string) => void
}

export default function FileSystem({ onOpenFile, onOpenTerminal, onSaveFile }: FileSystemProps) {
  const [fileSystem, setFileSystem] = useState(mockFileSystem)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null)
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [movingItem, setMovingItem] = useState<FileSystemItem | null>(null)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderPath, setNewFolderPath] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadPath, setUploadPath] = useState("/")
  const [expandedUploadFolders, setExpandedUploadFolders] = useState<string[]>([])

  const isArduinoFile = (filename: string) => {
    return filename.endsWith(".ino")
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const toggleUploadFolder = (path: string) => {
    setExpandedUploadFolders((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const handleRename = (item: FileSystemItem) => {
    setIsRenaming(item.id)
    setNewName(item.name)
  }

  const updateFileSystem = (
    items: FileSystemItem[],
    itemId: string,
    updates: Partial<FileSystemItem>,
  ): FileSystemItem[] => {
    return items.map((item) => {
      if (item.id === itemId) {
        return { ...item, ...updates }
      }
      if (item.children) {
        return {
          ...item,
          children: updateFileSystem(item.children, itemId, updates),
        }
      }
      return item
    })
  }

  const submitRename = (item: FileSystemItem) => {
    if (!newName.trim()) return

    const newPath = item.path.replace(item.name, newName)
    setFileSystem((prev) =>
      updateFileSystem(prev, item.id, {
        name: newName,
        path: newPath,
      }),
    )
    setIsRenaming(null)
  }

  const deleteItem = (item: FileSystemItem) => {
    const deleteFromArray = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.filter((i) => {
        if (i.id === item.id) return false
        if (i.children) {
          i.children = deleteFromArray(i.children)
        }
        return true
      })
    }

    setFileSystem((prev) => deleteFromArray(prev))
  }

  const startMoveItem = (item: FileSystemItem) => {
    setMovingItem(item)
    setShowMoveDialog(true)
  }

  const moveItem = (targetPath: string) => {
    if (!movingItem) return

    const removeFromSource = (items: FileSystemItem[]): [FileSystemItem[], FileSystemItem | null] => {
      let movedItem: FileSystemItem | null = null
      const newItems = items.filter((item) => {
        if (item.id === movingItem.id) {
          movedItem = { ...item, path: `${targetPath}/${item.name}` }
          return false
        }
        if (item.children) {
          const [newChildren, found] = removeFromSource(item.children)
          item.children = newChildren
          if (found) movedItem = found
        }
        return true
      })
      return [newItems, movedItem]
    }

    const addToTarget = (items: FileSystemItem[], targetPath: string, itemToAdd: FileSystemItem): FileSystemItem[] => {
      return items.map((item) => {
        if (item.path === targetPath && item.type === "directory") {
          return {
            ...item,
            children: [...(item.children || []), itemToAdd],
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addToTarget(item.children, targetPath, itemToAdd),
          }
        }
        return item
      })
    }

    setFileSystem((prev) => {
      const [newItems, movedItem] = removeFromSource(prev)
      if (movedItem) {
        return addToTarget(newItems, targetPath, movedItem)
      }
      return prev
    })

    setMovingItem(null)
    setShowMoveDialog(false)
  }

  const createFolder = (parentPath: string, folderName: string) => {
    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: "directory",
      path: `${parentPath}/${folderName}`,
      children: [],
    }

    const addToPath = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.path === parentPath && item.type === "directory") {
          return {
            ...item,
            children: [...(item.children || []), newFolder],
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addToPath(item.children),
          }
        }
        return item
      })
    }

    setFileSystem((prev) => {
      if (parentPath === "/") {
        return [...prev, newFolder]
      }
      return addToPath(prev)
    })
    setShowNewFolderDialog(false)
    setNewFolderName("")
    setNewFolderPath("")
  }

  const handleFileSave = (path: string, content: string) => {
    const pathParts = path.split("/")
    const fileName = pathParts.pop()!
    const parentPath = pathParts.join("/")

    const newFile: FileSystemItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: "file",
      path: path,
      content: content,
    }

    const addToPath = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.path === parentPath && item.type === "directory") {
          // Check if file already exists
          const existingFileIndex = item.children?.findIndex((child) => child.path === path)
          if (existingFileIndex !== undefined && existingFileIndex !== -1 && item.children) {
            // Update existing file
            const newChildren = [...item.children]
            newChildren[existingFileIndex] = newFile
            return { ...item, children: newChildren }
          }
          // Add new file
          return {
            ...item,
            children: [...(item.children || []), newFile],
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addToPath(item.children),
          }
        }
        return item
      })
    }

    setFileSystem((prev) => {
      if (parentPath === "") {
        const existingFileIndex = prev.findIndex((item) => item.path === path)
        if (existingFileIndex !== -1) {
          const newFiles = [...prev]
          newFiles[existingFileIndex] = newFile
          return newFiles
        }
        return [...prev, newFile]
      }
      return addToPath(prev)
    })
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        handleFileSave(`${uploadPath === "/" ? "" : uploadPath}/${file.name}`, content)
      }
      reader.readAsText(file)
    })
    setShowUploadDialog(false)
  }

  const renderFolderTree = (items: FileSystemItem[], level = 0, forUpload = false) => {
    return items.map((item) => {
      if (item.type !== "directory") return null

      const expanded = forUpload ? expandedUploadFolders.includes(item.path) : expandedFolders.includes(item.path)
      const toggleFn = forUpload ? toggleUploadFolder : toggleFolder
      const selectedPathState = forUpload ? uploadPath : newFolderPath

      return (
        <div key={item.id}>
          <Button
            variant="ghost"
            className={`w-full justify-start ${selectedPathState === item.path ? "bg-accent" : ""}`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => (forUpload ? setUploadPath(item.path) : setNewFolderPath(item.path))}
          >
            <ChevronRight
              className={`h-4 w-4 mr-2 transition-transform ${expanded ? "rotate-90" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleFn(item.path)
              }}
            />
            <Folder className="h-4 w-4 mr-2" />
            {item.name}
          </Button>
          {expanded && item.children && <div>{renderFolderTree(item.children, level + 1, forUpload)}</div>}
        </div>
      )
    })
  }

  const renderUploadDialog = () => (
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Upload Location</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr,2fr] gap-4">
          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${uploadPath === "/" ? "bg-accent" : ""}`}
              onClick={() => setUploadPath("/")}
            >
              <Folder className="h-4 w-4 mr-2" />
              Root
            </Button>
            {renderFolderTree(fileSystem, 0, true)}
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Path</h4>
              <p className="text-sm text-muted-foreground">{uploadPath}</p>
            </div>
            <div className="space-y-2">
              <Input type="file" multiple className="hidden" id="file-upload" onChange={handleUpload} />
              <Button asChild className="w-full">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </label>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderNewFolderDialog = () => (
    <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr,2fr] gap-4">
          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${newFolderPath === "/" ? "bg-accent" : ""}`}
              onClick={() => setNewFolderPath("/")}
            >
              <Folder className="h-4 w-4 mr-2" />
              Root
            </Button>
            {renderFolderTree(fileSystem)}
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Path</h4>
              <p className="text-sm text-muted-foreground">{newFolderPath}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="folderName" className="text-sm font-medium">
                Folder Name
              </label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => createFolder(newFolderPath || "/", newFolderName)} disabled={!newFolderName}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const renderFileSystem = (items: FileSystemItem[], level = 0) => {
    return items.map((item) => {
      const expanded = expandedFolders.includes(item.path)

      return (
        <div key={item.id}>
          <ContextMenu>
            <ContextMenuTrigger>
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedItem?.id === item.id ? "bg-accent" : ""}`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => {
                  if (item.type === "file") {
                    onOpenFile(item, isArduinoFile(item.name) ? "arduino" : "text")
                  } else {
                    toggleFolder(item.path)
                  }
                  setSelectedItem(item)
                }}
              >
                {item.type === "directory" ? (
                  <ChevronRight
                    className={`h-4 w-4 mr-2 transition-transform ${expanded ? "rotate-90" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFolder(item.path)
                    }}
                  />
                ) : null}
                {item.type === "directory" ? <Folder className="h-4 w-4 mr-2" /> : <File className="h-4 w-4 mr-2" />}
                {isRenaming === item.id ? (
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitRename(item)
                      }
                    }}
                    onBlur={() => submitRename(item)}
                    className="text-sm"
                  />
                ) : (
                  item.name
                )}
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {item.type === "file" ? (
                <ContextMenuItem onClick={() => onOpenFile(item, isArduinoFile(item.name) ? "arduino" : "text")}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Open
                </ContextMenuItem>
              ) : null}
              {item.type === "directory" ? (
                <ContextMenuItem onClick={() => onOpenTerminal(item.path)}>
                  <Terminal className="h-4 w-4 mr-2" />
                  Open Terminal Here
                </ContextMenuItem>
              ) : null}
              <ContextMenuItem onClick={() => handleRename(item)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => startMoveItem(item)}>
                <Move className="h-4 w-4 mr-2" />
                Move
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => deleteItem(item)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          {expanded && item.children && <div className="ml-4">{renderFileSystem(item.children, level + 1)}</div>}
        </div>
      )
    })
  }

  const renderMoveDialog = () => (
    <Dialog open={showMoveDialog} onOpenChange={() => setShowMoveDialog(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Move to...</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr,2fr] gap-4">
          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">{renderFolderTree(fileSystem)}</div>
          <div>
            <h4 className="text-sm font-medium mb-2">Target Path</h4>
            <p className="text-sm text-muted-foreground">{newFolderPath}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => moveItem(newFolderPath)} disabled={!newFolderPath}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">File System</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button size="sm" onClick={() => setShowNewFolderDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{renderFileSystem(fileSystem)}</div>
      {renderMoveDialog()}
      {renderNewFolderDialog()}
      {renderUploadDialog()}
    </div>
  )
}

// Helper function to get all folder paths
function getAllFolderPaths(items: FileSystemItem[], parentPath = ""): string[] {
  return items.reduce((paths: string[], item) => {
    if (item.type === "directory") {
      const currentPath = `${parentPath}/${item.name}`.replace(/^\/+/, "/")
      return [...paths, currentPath, ...(item.children ? getAllFolderPaths(item.children, currentPath) : [])]
    }
    return paths
  }, [])
}

