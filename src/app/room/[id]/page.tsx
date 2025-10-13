"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

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

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const roomId = params.id as string

  useEffect(() => {
    if (roomId && user?.id) {
      fetchRoomData()
    }
  }, [roomId, user?.id])

  const fetchRoomData = async () => {
    try {
      setLoading(true)
      
      const roomResponse = await fetch(`/api/rooms/${roomId}`)
      if (!roomResponse.ok) {
        throw new Error('Room not found')
      }
      
      const roomData = await roomResponse.json()
      setRoom(roomData.room)
      
      const playersResponse = await fetch(`/api/room-players?room_id=${roomId}`)
      if (playersResponse.ok) {
        const playersData = await playersResponse.json()
        setPlayers(playersData.players || [])
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading room...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold">Room {room?.room_code}</h1>
              <Badge variant={room?.status === 'waiting' ? 'default' : 'secondary'}>
                {room?.status === 'waiting' ? 'Waiting' : 'Active'}
              </Badge>
            </div>
            
            <div></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Room Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Room Code</label>
                  <p className="text-2xl font-mono font-bold">{room?.room_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Owner</label>
                  <p className="font-medium">{room?.owner_username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="font-medium capitalize">{room?.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Players</label>
                  <p className="font-medium">{players.length} joined</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div 
                      key={player.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{player.username}</span>
                      </div>
                      {player.user_id === room?.owner_id && (
                        <Badge variant="secondary">Owner</Badge>
                      )}
                    </div>
                  ))}
                  
                  {players.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No players in this room yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
