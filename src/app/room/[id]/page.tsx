"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, Play, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRoomWebSocket } from "@/hooks/useRoomWebSocket"

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
  
  const roomId = params?.id as string

  // Early return if no room ID
  if (!roomId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">Invalid room ID</p>
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
  
  // Use WebSocket for real-time updates
  const { 
    room, 
    players, 
    isConnected, 
    isConnecting,
    isPolling,
    error: wsError, 
    reconnect 
  } = useRoomWebSocket(roomId)
  
  const [leaving, setLeaving] = useState(false)
  const [startingGame, setStartingGame] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle WebSocket errors (but not polling mode)
  useEffect(() => {
    if (wsError && !isPolling) {
      setError(wsError)
    } else {
      setError(null)
    }
  }, [wsError, isPolling])

  const handleLeaveRoom = async () => {
    if (!user?.id) return
    
    setLeaving(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // If room was deleted or user successfully left, go back to dashboard
        if (result.room_deleted || result.message.includes('Successfully left')) {
          router.push('/dashboard')
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to leave room')
      }
    } catch (error) {
      console.error('Failed to leave room:', error)
      alert('Failed to leave room. Please try again.')
    } finally {
      setLeaving(false)
    }
  }

  const handleStartGame = async () => {
    if (!user?.id || !room?.room_id) return
    
    setStartingGame(true)
    try {
      // Update room status to 'playing' 
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'playing',
          owner_id: user.id
        })
      })
      
      if (response.ok) {
        // Redirect to game page
        router.push(`/game/${roomId}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to start game')
      }
    } catch (error) {
      console.error('Failed to start game:', error)
      alert('Failed to start game. Please try again.')
    } finally {
      setStartingGame(false)
    }
  }

  if (isConnecting || (!room && !error && !wsError)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {isConnecting ? 'Connecting to room...' : 'Loading room...'}
            </p>
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
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          {/* Header - Stack on mobile, flex on larger screens */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">Room {room?.room_code}</h1>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={room?.status === 'waiting' ? 'default' : 'secondary'}>
                  {room?.status === 'waiting' ? 'Waiting' : 'Active'}
                </Badge>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reconnect}
                    disabled={isConnecting}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${isConnecting ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected 
                  ? (isPolling
                      ? '🟡 Real-time updates via polling' 
                      : '🟢 Real-time updates via WebSocket')
                  : '🔴 Reconnecting...'
                }
              </p>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
              disabled={leaving}
              className="w-full sm:w-auto"
            >
              {leaving ? 'Leaving...' : 'Leave Room'}
            </Button>
          </div>

          {/* Main content - Flex layout for responsive design */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Room Information Card - Full width on mobile, half on desktop */}
            <Card className="flex-1 lg:flex-none lg:w-1/2">
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
                  <p className="font-medium">{players.length}/4 joined</p>
                  {players.length >= 4 && (
                    <Badge variant="secondary" className="mt-1">Room Full</Badge>
                  )}
                </div>
                
                {/* DEBUG: Show ownership and status info */}
                <div className="pt-4 border-t bg-muted/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    DEBUG - User ID: {user?.id}, Owner ID: {room?.owner_id}, Room Status: {room?.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Is Owner: {user?.id == room?.owner_id ? 'YES' : 'NO'}, Is Waiting: {room?.status === 'waiting' ? 'YES' : 'NO'}
                  </p>
                </div>

                {/* Start Game Button - Only visible to room owner */}
                {user?.id == room?.owner_id && room?.status == 'waiting' && (
                  <div className="pt-4 border-t space-y-3">
                    <Button
                      onClick={handleStartGame}
                      disabled={startingGame || players.length < 4}
                      className={`w-full ${players.length >= 4 ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' : ''}`}
                      size="lg"
                      variant={players.length >= 4 ? "default" : "secondary"}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {startingGame 
                        ? 'Starting Game - All Players Will Be Redirected...' 
                        : players.length < 4 
                          ? `Need 4 players to start (${players.length}/4)` 
                          : `🎮 START GAME NOW! (${players.length} players ready)`
                      }
                    </Button>
                    
                    {players.length < 4 && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground text-center">
                          ⚠️ Need exactly 4 players to start the game
                        </p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          Share the room code <strong>{room?.room_code}</strong> with your friends!
                        </p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {4 - players.length} more player(s) needed
                        </p>
                      </div>
                    )}
                    
                    {players.length == 4 && (
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-300 dark:border-green-700">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 text-center">
                          🎉 Ready to start! Room is full with 4 players!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 text-center mt-1">
                          Click "START GAME NOW!" to begin - all players will be automatically redirected to the game!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Show message when start button conditions aren't met */}
                {!(user?.id == room?.owner_id && room?.status == 'waiting') && (
                  <div className="pt-4 border-t">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium text-center">
                        {user?.id !== room?.owner_id 
                          ? "Only the room owner can start the game"
                          : room?.status !== 'waiting'
                            ? `Room status is "${room?.status}" - can only start when "waiting"`
                            : "Start button conditions not met"
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Status message for non-owners */}
                {user?.id !== room?.owner_id && room?.status === 'waiting' && (
                  <div className="pt-4 border-t">
                    <div className={`p-3 rounded-lg text-center ${
                      players.length >= 4 
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                        : 'bg-muted/30'
                    }`}>
                      <p className={`text-sm ${
                        players.length >= 4 
                          ? 'text-green-800 dark:text-green-200 font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {players.length >= 4 
                          ? `🎮 Room is full! Waiting for ${room?.owner_username} to start the game...`
                          : `Waiting for ${room?.owner_username} to start the game...`
                        }
                      </p>
                      {players.length < 4 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Need 4 players to start ({players.length}/4)
                        </p>
                      )}
                      {players.length >= 4 && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          You'll be automatically redirected when the game starts!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Players Card - Full width on mobile, half on desktop */}
            <Card className="flex-1 lg:flex-none lg:w-1/2">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg">Players ({players.length}/4)</span>
                  {players.length === 4 && (
                    <Badge variant="default" className="bg-green-500">
                      Full Room!
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div 
                      key={player.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50"
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
                  
                  {/* Empty slots visualization */}
                  {Array.from({ length: 4 - players.length }).map((_, index) => (
                    <div 
                      key={`empty-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm">
                          ?
                        </div>
                        <span className="text-muted-foreground">Waiting for player...</span>
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
        </div>
      </div>
    </ProtectedRoute>
  )
}
