import { NextApiRequest, NextApiResponse } from 'next'
import { WebSocketServer, WebSocket } from 'ws'
import { query } from '@/lib/db'
import { IncomingMessage } from 'http'

interface ExtendedNextApiResponse extends NextApiResponse {
  socket: any
}

interface RoomData {
  room_id: number
  room_code: string
  status: string
  owner_id: number
  owner_username: string
  player_count: number
}

interface PlayerData {
  user_id: number
  username: string
  joined_at: string
}

interface WebSocketMessage {
  type: 'room_update' | 'player_joined' | 'player_left' | 'game_started' | 'error'
  roomId: string
  data?: any
}

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const roomConnections = new Map<string, Set<WebSocket>>()

export default function handler(req: NextApiRequest, res: ExtendedNextApiResponse) {
  if (res.socket.server.wss) {
    console.log('WebSocket server already running')
    res.end()
    return
  }

  console.log('Setting up WebSocket server...')
  
  wss = new WebSocketServer({ noServer: true })
  res.socket.server.wss = wss

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('New WebSocket connection established')
    
    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('Received WebSocket message:', data)
        
        if (data.type === 'join_room') {
          const roomId = data.roomId
          
          // Add connection to room
          if (!roomConnections.has(roomId)) {
            roomConnections.set(roomId, new Set())
          }
          roomConnections.get(roomId)!.add(ws)
          
          // Store room ID on WebSocket for cleanup
          ;(ws as any).roomId = roomId
          
          console.log(`Client joined room ${roomId}. Total connections: ${roomConnections.get(roomId)!.size}`)
          
          // Send current room data immediately
          await sendRoomUpdate(roomId)
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }))
      }
    })
    
    ws.on('close', () => {
      // Remove connection from room
      const roomId = (ws as any).roomId
      if (roomId && roomConnections.has(roomId)) {
        roomConnections.get(roomId)!.delete(ws)
        if (roomConnections.get(roomId)!.size === 0) {
          roomConnections.delete(roomId)
        }
        console.log(`Client left room ${roomId}`)
      }
      console.log('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })

  // Handle HTTP upgrade to WebSocket
  res.socket.server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    if (wss) {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss!.emit('connection', ws, request)
      })
    }
  })

  res.end()
}

// Helper function to send room updates
export async function sendRoomUpdate(roomId: string) {
  try {
    console.log(`Sending room update for room ${roomId}`)
    const connections = roomConnections.get(roomId)
    if (!connections || connections.size === 0) {
      console.log(`No connections found for room ${roomId}`)
      return
    }

    // Fetch current room data
    const rooms = await query<RoomData>(
      `SELECT r.*, u.username as owner_username, 
       (SELECT COUNT(*) FROM room_players WHERE room_id = r.room_id) as player_count
       FROM rooms r 
       JOIN users u ON r.owner_id = u.user_id 
       WHERE r.room_id = ?`,
      [parseInt(roomId)]
    )

    if (rooms.length === 0) {
      console.log(`Room ${roomId} not found`)
      return
    }

    const room = rooms[0]

    // Fetch players
    const players = await query<PlayerData>(
      `SELECT rp.user_id, u.username, rp.joined_at
       FROM room_players rp
       JOIN users u ON rp.user_id = u.user_id
       WHERE rp.room_id = ?
       ORDER BY rp.joined_at ASC`,
      [parseInt(roomId)]
    )

    const message: WebSocketMessage = {
      type: 'room_update',
      roomId,
      data: {
        room: {
          ...room,
          player_count: players.length
        },
        players
      }
    }

    console.log(`Broadcasting room update to ${connections.size} connections`)
    
    // Send to all connected clients in this room
    const deadConnections: WebSocket[] = []
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        deadConnections.push(ws)
      }
    })

    // Clean up dead connections
    deadConnections.forEach(ws => connections.delete(ws))
    
  } catch (error) {
    console.error('Error sending room update:', error)
  }
}

// Helper function to broadcast game start
export async function broadcastGameStart(roomId: string) {
  try {
    console.log(`Broadcasting game start for room ${roomId}`)
    const connections = roomConnections.get(roomId)
    if (!connections || connections.size === 0) {
      console.log(`No connections found for room ${roomId}`)
      return
    }

    const message: WebSocketMessage = {
      type: 'game_started',
      roomId,
      data: { redirectTo: `/game/${roomId}` }
    }

    console.log(`Broadcasting game start to ${connections.size} connections`)
    
    const deadConnections: WebSocket[] = []
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        deadConnections.push(ws)
      }
    })

    // Clean up dead connections
    deadConnections.forEach(ws => connections.delete(ws))
    
  } catch (error) {
    console.error('Error broadcasting game start:', error)
  }
}