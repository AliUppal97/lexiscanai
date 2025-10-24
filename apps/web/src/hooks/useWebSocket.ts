"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAuth } from "./useAuth"

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error"

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
}

export interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
  reconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
  heartbeatInterval?: number
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (message: WebSocketMessage) => void
}

interface UseWebSocketReturn {
  status: WebSocketStatus
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  send: (type: string, data: any) => void
  subscribe: (type: string, callback: (data: any) => void) => () => void
  connect: () => void
  disconnect: () => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"

/**
 * useWebSocket - Real-time WebSocket connection management
 * 
 * Features:
 * - Automatic reconnection
 * - Authentication via JWT
 * - Message type subscription
 * - Heartbeat/ping mechanism
 * - Connection state management
 * - Type-safe message handling
 * - Error recovery
 * 
 * @example
 * const { status, lastMessage, send, subscribe } = useWebSocket({
 *   onOpen: () => console.log('Connected'),
 *   autoConnect: true,
 *   reconnect: true
 * })
 * 
 * // Subscribe to specific message types
 * useEffect(() => {
 *   const unsubscribe = subscribe('document.processed', (data) => {
 *     console.log('Document processed:', data)
 *     toast.success('Document ready!', data.documentTitle)
 *   })
 *   return unsubscribe
 * }, [subscribe])
 * 
 * // Send message
 * const handleAction = () => {
 *   send('document.review', { documentId: '123' })
 * }
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = WS_URL,
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 10,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options

  const { session } = useAuth()
  const ws = useRef<WebSocket | null>(null)
  const reconnectCount = useRef(0)
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const subscribers = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  const [status, setStatus] = useState<WebSocketStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  // Send message
  const send = useCallback((type: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString(),
      }
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected. Cannot send message.")
    }
  }, [])

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
    }

    heartbeatTimer.current = setInterval(() => {
      send("ping", { timestamp: Date.now() })
    }, heartbeatInterval)
  }, [send, heartbeatInterval])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
      heartbeatTimer.current = null
    }
  }, [])

  // Handle incoming message
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        setLastMessage(message)
        onMessage?.(message)

        // Notify type-specific subscribers
        const typeSubscribers = subscribers.current.get(message.type)
        if (typeSubscribers) {
          typeSubscribers.forEach((callback) => {
            try {
              callback(message.data)
            } catch (err) {
              console.error(`Error in subscriber for ${message.type}:`, err)
            }
          })
        }

        // Notify wildcard subscribers
        const wildcardSubscribers = subscribers.current.get("*")
        if (wildcardSubscribers) {
          wildcardSubscribers.forEach((callback) => {
            try {
              callback(message)
            } catch (err) {
              console.error("Error in wildcard subscriber:", err)
            }
          })
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err)
      }
    },
    [onMessage]
  )

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    if (!session?.accessToken) {
      console.warn("Cannot connect to WebSocket: No auth token")
      return
    }

    setStatus("connecting")

    try {
      // Include auth token in URL query params
      const wsUrl = `${url}?token=${session.accessToken}`
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = (event) => {
        setStatus("connected")
        reconnectCount.current = 0
        startHeartbeat()
        onOpen?.(event)
      }

      ws.current.onmessage = handleMessage

      ws.current.onerror = (event) => {
        setStatus("error")
        onError?.(event)
      }

      ws.current.onclose = (event) => {
        setStatus("disconnected")
        stopHeartbeat()
        onClose?.(event)

        // Attempt reconnection
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++
          console.log(`Reconnecting... (${reconnectCount.current}/${reconnectAttempts})`)

          reconnectTimer.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
    } catch (err) {
      setStatus("error")
      console.error("WebSocket connection error:", err)
    }
  }, [
    session,
    url,
    reconnect,
    reconnectAttempts,
    reconnectInterval,
    onOpen,
    onClose,
    onError,
    handleMessage,
    startHeartbeat,
    stopHeartbeat,
  ])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    stopHeartbeat()

    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    if (ws.current) {
      ws.current.close(1000, "Client disconnect")
      ws.current = null
    }

    setStatus("disconnected")
  }, [stopHeartbeat])

  // Subscribe to message type
  const subscribe = useCallback(
    (type: string, callback: (data: any) => void): (() => void) => {
      if (!subscribers.current.has(type)) {
        subscribers.current.set(type, new Set())
      }

      const typeSubscribers = subscribers.current.get(type)!
      typeSubscribers.add(callback)

      // Return unsubscribe function
      return () => {
        typeSubscribers.delete(callback)
        if (typeSubscribers.size === 0) {
          subscribers.current.delete(type)
        }
      }
    },
    []
  )

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && session?.accessToken) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, session?.accessToken, connect, disconnect])

  return {
    status,
    isConnected: status === "connected",
    lastMessage,
    send,
    subscribe,
    connect,
    disconnect,
  }
}

/**
 * useDocumentUpdates - Specialized hook for document processing updates
 * 
 * @example
 * const { processingDocuments, onDocumentProcessed } = useDocumentUpdates()
 * 
 * onDocumentProcessed((doc) => {
 *   console.log('Document ready:', doc)
 *   refreshDocumentList()
 * })
 */
export function useDocumentUpdates() {
  const { subscribe } = useWebSocket({ autoConnect: true })
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set())

  const onDocumentProcessed = useCallback(
    (callback: (document: any) => void) => {
      return subscribe("document.processed", (data) => {
        setProcessingDocuments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.documentId)
          return newSet
        })
        callback(data)
      })
    },
    [subscribe]
  )

  const onDocumentFailed = useCallback(
    (callback: (error: any) => void) => {
      return subscribe("document.failed", (data) => {
        setProcessingDocuments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.documentId)
          return newSet
        })
        callback(data)
      })
    },
    [subscribe]
  )

  const onProcessingStarted = useCallback(
    (callback: (document: any) => void) => {
      return subscribe("document.processing", (data) => {
        setProcessingDocuments((prev) => new Set(prev).add(data.documentId))
        callback(data)
      })
    },
    [subscribe]
  )

  return {
    processingDocuments,
    onDocumentProcessed,
    onDocumentFailed,
    onProcessingStarted,
  }
}

