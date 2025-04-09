type MessageType = "console" | "ros2" | "filesystem" | "system"

interface WebSocketMessage {
  type: MessageType
  action: string
  payload: any
}

class WebSocketConnection {
  private ws: WebSocket | null = null
  private messageCallbacks: Map<MessageType, ((data: any) => void)[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(url: string) {
    this.connect(url)
  }

  private connect(url: string) {
    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        this.handleReconnect(url)
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Connection error:", error)
      this.handleReconnect(url)
    }
  }

  private handleReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(url), this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const callbacks = this.messageCallbacks.get(message.type) || []
    callbacks.forEach((callback) => callback(message))
  }

  public subscribe(type: MessageType, callback: (data: any) => void) {
    const callbacks = this.messageCallbacks.get(type) || []
    callbacks.push(callback)
    this.messageCallbacks.set(type, callbacks)
  }

  public unsubscribe(type: MessageType, callback: (data: any) => void) {
    const callbacks = this.messageCallbacks.get(type) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
      this.messageCallbacks.set(type, callbacks)
    }
  }

  public send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  public isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsConnection = new WebSocketConnection("ws://localhost:8765")
