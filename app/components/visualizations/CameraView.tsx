"use client"

export default function CameraView() {
  return (
    <div className="w-full h-48 bg-black flex items-center justify-center overflow-hidden">
      <img
        src="/placeholder.svg?height=480&width=640"
        alt="Camera Feed"
        className="max-w-full max-h-full object-cover"
      />
    </div>
  )
}

