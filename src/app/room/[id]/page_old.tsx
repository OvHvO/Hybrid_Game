"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Users, Crown, Clock, Settings, ArrowLeft, Play, Copy, Check } from "lucide-react"
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
  
  // Real API state
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const roomId = params.id as string

  useEffect(() => {
    if (roomId && user?.id) {
      fetchRoomData()
    }
  }, [roomId, user?.id])

  const fetchRoomData = async () => {
    try {
      setLoading(true)
      
      // Fetch room details
      const roomResponse = await fetch(`/api/rooms/${roomId}`)
      if (!roomResponse.ok) {
        throw new Error('Room not found')
      }
      
      const roomData = await roomResponse.json()
      setRoom(roomData.room)
      
      // Fetch room players
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

  const isHost = user?.id === room?.owner_id
  const allPlayersReady = true // Simplify for now - implement ready system later

  const handleStartGame = async () => {
    if (isHost && room) {
      try {
        // Update room status to 'active'
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'active'
          })
        })
        
        if (response.ok) {
          setRoom(prev => prev ? { ...prev, status: 'active' } : null)
          // Navigate to game page or update UI
          console.log('Game started!')
        }
      } catch (err) {
        console.error('Failed to start game:', err)
      }
    }
  }

  const handleLeaveRoom = async () => {
    try {
      const response = await fetch(`/api/room-players/${user?.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Failed to leave room:', err)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room?.room_code || '')
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code:", err)
    }
  }

  // Loading state
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

  // Error state
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

  const canStartGame = isHost && room?.status === 'waiting' && players.length >= 1

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background waves */}
        <div className="fixed inset-0 pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1C2321" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#5E6572" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1C2321" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M0,200 C300,150 600,250 1200,180 L1200,300 L0,300 Z" fill="url(#wave1)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="self-start"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">Room {room?.room_code}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="p-1"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Badge variant={room?.status === 'waiting' ? 'default' : 'secondary'} className="mt-2">
                {room?.status === 'waiting' ? 'Waiting for Players' : 'Game Active'}
              </Badge>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
            >
              Leave Room
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Room Info */}
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="font-medium">{room?.created_at ? new Date(room.created_at).toLocaleString() : 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
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
                      <div className="flex items-center gap-2">
                        {player.user_id === room?.owner_id && (
                          <Badge variant="secondary">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}
                        <Badge variant="default" className="text-xs">
                          Ready
                        </Badge>
                      </div>
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

          {/* Game Controls */}
          {isHost && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Game Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    className="flex items-center"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </Button>
                  {!canStartGame && players.length < 1 && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      Need at least 1 player to start the game
                    </p>
                  )}
                  {room?.status === 'active' && (
                    <Badge variant="secondary" className="self-start">
                      Game is currently active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Non-host players view */}
          {!isHost && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {room?.status === 'waiting' ? (
                    <p className="text-muted-foreground">Waiting for the host to start the game...</p>
                  ) : (
                    <p className="text-muted-foreground">Game is currently active!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}