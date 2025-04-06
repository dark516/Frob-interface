"use client"

import { useEffect, useRef } from "react"

export default function LidarView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mock LiDAR data (angles and distances)
    const mockData = Array.from({ length: 360 }, (_, i) => ({
      angle: i,
      distance: 50 + Math.random() * 50,
    }))

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw LiDAR points
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const scale = Math.min(canvas.width, canvas.height) / 200

    ctx.beginPath()
    mockData.forEach((point) => {
      const rad = (point.angle * Math.PI) / 180
      const x = centerX + Math.cos(rad) * point.distance * scale
      const y = centerY + Math.sin(rad) * point.distance * scale

      ctx.fillStyle = "#00ff00"
      ctx.fillRect(x - 1, y - 1, 2, 2)
    })
    ctx.stroke()

    // Draw circular grid
    ctx.strokeStyle = "#333"
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, i * 25 * scale, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-64 bg-black" />
}

