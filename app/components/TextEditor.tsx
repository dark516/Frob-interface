"use client"

import type React from "react"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SaveIcon, Upload, Folder, ChevronRight, Code } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
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

interface FileSystemItem {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  children?: FileSystemItem[]
  path: string
}

interface TextEditorProps {
  filePath?: string
  content: string
  isArduino?: boolean
  onSave?: (path: string, content: string) => void
  fileSystem?: FileSystemItem[]
  isMobile?: boolean
}

export default function TextEditor({
  filePath,
  content,
  isArduino = false,
  onSave,
  fileSystem = [],
  isMobile = false,
}: TextEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [isDirty, setIsDirty] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [selectedPath, setSelectedPath] = useState("/")
  const [fileName, setFileName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [editorMounted, setEditorMounted] = useState(false)
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
    if (value !== undefined) {
      setEditorContent(value)
      setIsDirty(true)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value)
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (filePath) {
      onSave?.(filePath, editorContent)
      setIsDirty(false)
    } else {
      setShowSaveDialog(true)
      // Extract filename from current file path or set default
      const defaultName = filePath?.split("/").pop() || "untitled" + (isArduino ? ".ino" : ".txt")
      setFileName(defaultName)
    }
  }

  const handleSaveConfirm = () => {
    if (selectedPath && fileName && onSave) {
      const fullPath = `${selectedPath === "/" ? "" : selectedPath}/${fileName}`
      onSave(fullPath, editorContent)
      setIsDirty(false)
      setShowSaveDialog(false)
    }
  }

  const handleUpload = () => {
    // In a real application, this would upload to the Arduino
    console.log("Uploading to Arduino:", editorContent)
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const renderFileSystem = (items: FileSystemItem[], level = 0) => {
    return items.map((item) => {
      if (item.type !== "directory") return null

      return (
        <div key={item.id}>
          <Button
            variant="ghost"
            className={`w-full justify-start ${selectedPath === item.path ? "bg-accent" : ""}`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => setSelectedPath(item.path)}
          >
            <ChevronRight
              className={`h-4 w-4 mr-2 transition-transform ${expandedFolders.includes(item.path) ? "rotate-90" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(item.path)
              }}
            />
            <Folder className="h-4 w-4 mr-2" />
            {item.name}
          </Button>
          {expandedFolders.includes(item.path) && item.children && (
            <div>{renderFileSystem(item.children, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  const getLanguage = () => {
    if (isArduino) return "cpp"
    if (!filePath) return "plaintext"
    const ext = filePath.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "py":
        return "python"
      case "js":
      case "jsx":
        return "javascript"
      case "ts":
      case "tsx":
        return "typescript"
      case "json":
        return "json"
      case "yaml":
      case "yml":
        return "yaml"
      case "md":
        return "markdown"
      case "sh":
      case "bash":
        return "shell"
      case "cpp":
      case "h":
      case "hpp":
        return "cpp"
      case "xml":
        return "xml"
      default:
        return "plaintext"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!isDirty}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          {isArduino && (
            <Button size="sm" onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
        {isDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
      </div>
      <div className="flex-1">
        {useSimpleEditor ? (
          <Textarea
            value={editorContent}
            onChange={handleTextareaChange}
            className="h-full font-mono text-sm resize-none p-4"
            placeholder="Enter code here..."
          />
        ) : (
          <MonacoEditor
            height="100%"
            defaultLanguage={getLanguage()}
            theme="vs-dark"
            value={editorContent}
            onChange={handleEditorChange}
            onMount={() => setEditorMounted(true)}
            options={{
              minimap: { enabled: !isMobile },
              fontSize: isMobile ? 16 : 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              // Increase padding for touch targets
              padding: isMobile ? { top: 10, bottom: 10 } : undefined,
            }}
          />
        )}
      </div>
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-lg" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle>Save File</DialogTitle>
          </DialogHeader>
          <div className={isMobile ? "flex flex-col space-y-4" : "grid grid-cols-[1fr,2fr] gap-4"}>
            <ScrollArea className={isMobile ? "h-[200px]" : "h-[400px]"} className="border rounded-lg p-4">
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${selectedPath === "/" ? "bg-accent" : ""}`}
                onClick={() => setSelectedPath("/")}
              >
                <Folder className="h-4 w-4 mr-2" />
                Root
              </Button>
              {renderFileSystem(fileSystem)}
            </ScrollArea>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Selected Path</h4>
                <p className="text-sm text-muted-foreground">{selectedPath}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="fileName" className="text-sm font-medium">
                  File Name
                </label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveConfirm} disabled={!fileName || !selectedPath}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
