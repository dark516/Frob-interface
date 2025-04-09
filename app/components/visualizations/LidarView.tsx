"use client"

import { useEffect, useRef } from "react"

export default function LidarView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw circular grid
    ctx.strokeStyle = "#333"
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const scale = Math.min(canvas.width, canvas.height) / 200

    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, i * 25 * scale, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw "No Connection" text
    ctx.font = "16px Arial"
    ctx.fillStyle = "#ff0000"
    ctx.textAlign = "center"
    ctx.fillText("No Connection to Robot", centerX, centerY - 10)
    ctx.font = "12px Arial"
    ctx.fillStyle = "#888888"
    ctx.fillText("LiDAR data unavailable", centerX, centerY + 20)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-64 bg-black" />
}
