type MessageType = "console" | "ros2" | "filesystem" | "system"

interface WebSocketMessage {
  type: MessageType
  action: string
  payload: any
}

// Modify the WebSocketConnection class to simulate disconnected state
class WebSocketConnection {
  private messageCallbacks: Map<MessageType, ((data: any) => void)[]> = new Map()

  constructor(url: string) {
    console.log("WebSocket connection simulation initialized (not actually connecting)")
  }

  public subscribe(type: MessageType, callback: (data: any) => void) {
    const callbacks = this.messageCallbacks.get(type) || []
    callbacks.push(callback)
    this.messageCallbacks.set(type, callbacks)
    console.log(`Subscribed to ${type} (simulation only)`)
  }

  public unsubscribe(type: MessageType, callback: (data: any) => void) {
    const callbacks = this.messageCallbacks.get(type) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
      this.messageCallbacks.set(type, callbacks)
    }
    console.log(`Unsubscribed from ${type} (simulation only)`)
  }

  public send(message: WebSocketMessage) {
    console.log("Attempted to send message (no connection):", message)
  }

  public isConnected() {
    return false // Always return false to indicate no connection
  }
}

export const wsConnection = new WebSocketConnection("ws://localhost:8765")
