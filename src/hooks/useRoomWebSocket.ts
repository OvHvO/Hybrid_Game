'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Room {
  room_id: number
  room_code: string
  status: string
  created_at: string
  owner_id: number
  owner_username: string
  player_count: number
}

interface RoomPlayer {
  user_id: number
  username: string
  joined_at: string
}

interface WebSocketMessage {
  type: 'room_update' | 'player_joined' | 'player_left' | 'game_started' | 'error'
  roomId: string
  data?: any
}

interface UseRoomWebSocketReturn {
  room: Room | null
  players: RoomPlayer[]
  isConnected: boolean
  isConnecting: boolean
  isPolling: boolean
  error: string | null
  sendMessage: (message: any) => void
  reconnect: () => void
  disconnect: () => void
}

export function useRoomWebSocket(roomId: string): UseRoomWebSocketReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add hook instance ID for debugging
  const hookId = useRef(Math.random().toString(36).substr(2, 9))
  
  console.log(`🎯 useRoomWebSocket hook initialized for room ${roomId} (Hook ID: ${hookId.current})`)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const router = useRouter()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPageVisible = useRef(true)

  const fetchRoomData = useCallback(async () => {
    // Don't fetch if polling has been stopped
    if (!pollIntervalRef.current && !isPolling) {
      console.log(`⏹️  [${hookId.current}] Skipping fetch - polling is stopped`)
      return
    }

    try {
      console.log(`📡 [${hookId.current}] Fetching room data for room ${roomId}`)
      
      const response = await fetch(`/api/rooms/${roomId}/state`);

      if (!response.ok) {
        // Room not found (404) or other error - stop polling immediately
        console.log(`⚠️  [${hookId.current}] Room ${roomId} not found (${response.status}). Stopping polling.`)
        
        // Stop polling immediately
        if (pollIntervalRef.current) {
          console.log(`🛑 [${hookId.current}] Clearing polling interval`)
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        
        setIsPolling(false)
        setIsConnected(false)
        setError('Room not found or has been closed')
        return
      }
      
      const roomData = await response.json()
      
      // Check if room status changed to 'playing' - redirect all players to game
      // This ensures synchronized game start for all players
      if (roomData.room.status === 'playing' && room?.status !== 'playing') {
        console.log(`🎮 [${hookId.current}] Game started! Redirecting all players to game page...`)
        
        // Stop polling before redirect
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        
        // Immediate redirect for synchronized start
        router.push(`/game/${roomId}`)
        return
      }
      
      setRoom(roomData.room)
      setPlayers(roomData.players || [])
      
    } catch (err) {
      console.error(`❌ [${hookId.current}] Polling error for room ${roomId}:`, err)
      
      // Stop polling on error to prevent continuous failed requests
      if (pollIntervalRef.current) {
        console.log(`🛑 [${hookId.current}] Clearing polling interval due to error`)
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      setIsPolling(false)
      setIsConnected(false)
      setError(err instanceof Error ? err.message : 'Failed to load room')
    }
  }, [roomId, room?.status, router])

  // Fallback polling function for when WebSocket is not available
  const startPolling = useCallback(async () => {
    console.log(`🔄 [${hookId.current}] Starting polling for room ${roomId}`)
    
    if (pollIntervalRef.current) {
      console.log(`⚠️  [${hookId.current}] Clearing existing polling interval for room ${roomId}`)
      clearInterval(pollIntervalRef.current)
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    // Initial fetch
    await fetchRoomData()
    setIsConnected(true) // Mark as "connected" for UI purposes

    // Start polling every 2 seconds for faster game start synchronization
    // Only poll when page is visible to reduce unnecessary requests
    pollIntervalRef.current = setInterval(async () => {
      if (isPageVisible.current) {
        console.log(`📡 [${hookId.current}] Polling room ${roomId} for updates`)
        await fetchRoomData()
      } else {
        console.log(`⏸️  [${hookId.current}] Skipping poll for room ${roomId} - page not visible`)
      }
    }, 2000)
    
    setIsPolling(true)
  }, [roomId, fetchRoomData]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    setIsConnecting(true)
    setError(null)

    try {
      // First, initialize the WebSocket server by calling the API endpoint
      fetch('/api/websocket', { method: 'GET' })
        .then(() => {
          // Wait a bit for server to initialize, then connect
          setTimeout(() => {
            try {
              // Use wss:// for production, ws:// for development
              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
              const wsUrl = `${protocol}//${window.location.host}/_next/webpack-hmr`
              
              // For development, we'll use polling as WebSocket upgrade in Next.js dev is complex
              if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Using polling fallback instead of WebSocket')
                setIsPolling(true)
                setError(null)
                setIsConnecting(false)
                // Use polling in development
                startPolling()
                return
              }
              
              const ws = new WebSocket(wsUrl)
              wsRef.current = ws

              ws.onopen = () => {
                console.log('WebSocket connected')
                setIsConnected(true)
                setIsConnecting(false)
                setError(null)
                reconnectAttemptsRef.current = 0
                
                // Join the room
                ws.send(JSON.stringify({
                  type: 'join_room',
                  roomId: roomId
                })) 
              }

              ws.onmessage = (event) => {
                try {
                  const message: WebSocketMessage = JSON.parse(event.data)
                  
                  switch (message.type) {
                    case 'room_update':
                      if (message.data) {
                        setRoom(message.data.room)
                        setPlayers(message.data.players || [])
                      }
                      break
                      
                    case 'game_started':
                      console.log('Game started! Redirecting...')
                      if (message.data?.redirectTo) {
                        router.push(message.data.redirectTo)
                      }
                      break
                      
                    case 'error':
                      console.error('WebSocket server error:', message.data)
                      setError(message.data?.message || 'WebSocket error occurred')
                      break
                      
                    default:
                      console.log('Unknown message type:', message.type)
                  }
                } catch (err) {
                  console.error('Failed to parse WebSocket message:', err)
                }
              }

              ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason)
                setIsConnected(false)
                setIsConnecting(false)
                
                // Attempt to reconnect if not intentionally closed
                if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
                  const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000 // Exponential backoff
                  console.log(`Attempting to reconnect in ${delay}ms...`)
                  
                  reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttemptsRef.current++
                    connect()
                  }, delay)
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                  setIsPolling(true)
                  setError(null)
                  startPolling()
                }
              }

              ws.onerror = (error) => {
                console.error('WebSocket connection error, falling back to polling:', error)
                setIsPolling(true)
                setError(null)
                setIsConnecting(false)
                // Fallback to polling
                startPolling()
              }

            } catch (err) {
              console.error('Failed to create WebSocket connection, using polling fallback:', err)
              setIsPolling(true)
              setError(null)
              setIsConnecting(false)
              startPolling()
            }
          }, 100)
        })
        .catch(() => {
          console.log('WebSocket server not available, using polling fallback')
          setIsPolling(true)
          setError(null)
          setIsConnecting(false)
          startPolling()
        })

    } catch (err) {
      console.error('Failed to initialize WebSocket, using polling fallback:', err)
      setIsPolling(true)
      setError(null)
      setIsConnecting(false)
      startPolling()
    }
  }, [roomId, router])

  const disconnect = useCallback(() => {
    console.log(`🛑 [${hookId.current}] Disconnecting from room ${roomId} polling/WebSocket`)
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (pollIntervalRef.current) {
      console.log(`🛑 [${hookId.current}] Clearing polling interval for room ${roomId}`)
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
    setIsPolling(false)
  }, [roomId])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    // Try WebSocket first, fallback to polling if it fails
    connect()
  }, [connect, disconnect])

  // Handle page visibility to pause polling when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden
      
      // If page becomes visible and we're polling, do an immediate fetch
      if (!document.hidden && isPolling && pollIntervalRef.current) {
        fetchRoomData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPolling, fetchRoomData])

  useEffect(() => {
    if (roomId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [roomId, connect, disconnect])

  // Cleanup on unmount  
  useEffect(() => {
    return () => {
      console.log(`🔥 [${hookId.current}] Hook unmounting - cleaning up room ${roomId}`)
      disconnect()
    }
  }, [disconnect, roomId])

  // Additional cleanup when roomId changes
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        console.log(`🧹 [${hookId.current}] Cleaning up polling on roomId change`)
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [roomId])

  return {
    room,
    players,
    isConnected,
    isConnecting,
    isPolling,
    error,
    sendMessage,
    reconnect,
    disconnect
  }
}