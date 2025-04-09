"use client"

export default function CameraView() {
  // Modify CameraView to show a static image with "No Connection" message
  return (
    <div className="w-full h-48 bg-black flex items-center justify-center overflow-hidden relative">
      <img
        src="/placeholder.svg?height=480&width=640"
        alt="Camera Feed"
        className="max-w-full max-h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-red-500 font-semibold">No Connection to Robot</p>
        <p className="text-gray-400 text-sm">Camera feed unavailable</p>
      </div>
    </div>
  )
}
