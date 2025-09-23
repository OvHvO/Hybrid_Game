"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Users, Crown, Clock, Settings, ArrowLeft, Play, Copy, Check } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

// Mock data for room and players
const mockRoomData = {
  id: "1",
  name: "Epic Battle Arena",
  host: "PlayerOne",
  gameMode: "Battle Royale",
  maxPlayers: 4,
  status: "waiting",
  roomCode: "GAME123",
  settings: {
    difficulty: "Normal",
    timeLimit: "10 minutes",
    map: "Desert Storm",
  },
}

const mockPlayers = [
  {
    id: "1",
    username: "PlayerOne",
    isHost: true,
    isReady: true,
    avatar: "/gaming-avatar-1.png",
  },
  {
    id: "2",
    username: "ShadowHunter",
    isHost: false,
    isReady: true,
    avatar: "/gaming-avatar-2.png",
  },
  {
    id: "3",
    username: "FireStorm",
    isHost: false,
    isReady: false,
    avatar: "/gaming-avatar-3.png",
  },
]

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [players, setPlayers] = useState(mockPlayers)
  const [roomData] = useState(mockRoomData)
  const [isReady, setIsReady] = useState(true)
  const [copied, setCopied] = useState(false)

  const currentUser = user?.username || "PlayerOne"
  const isHost = currentUser === roomData.host
  const currentPlayer = players.find((p) => p.username === currentUser)
  const allPlayersReady = players.every((p) => p.isReady)

  const handleStartGame = () => {
    if (isHost && allPlayersReady) {
      // TODO: Implement start game logic
      console.log("Starting game...")
      router.push(`/game/${params.id}`)
    }
  }

  const handleToggleReady = () => {
    setIsReady(!isReady)
    setPlayers((prev) => prev.map((p) => (p.username === currentUser ? { ...p, isReady: !isReady } : p)))
  }

  const handleLeaveRoom = () => {
    // TODO: Implement leave room logic
    console.log("Leaving room...")
    router.push("/dashboard")
  }

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomData.roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 md:h-32">
            <path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
              fill="#1C2321"
              fillOpacity="0.1"
            />
            <path
              d="M0,80 C300,20 600,100 900,40 C1050,10 1150,70 1200,40 L1200,120 L0,120 Z"
              fill="#5E6572"
              fillOpacity="0.08"
            />
            <path
              d="M0,100 C300,40 600,120 900,80 C1050,50 1150,110 1200,80 L1200,120 L0,120 Z"
              fill="#E6E49F"
              fillOpacity="0.06"
            />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLeaveRoom}
                    className="flex items-center gap-2 self-start"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6 hidden sm:block" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{roomData.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {roomData.gameMode}
                      </Badge>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <span className="truncate">Room: {roomData.roomCode}</span>
                        <Button variant="ghost" size="sm" onClick={copyRoomCode} className="h-auto p-1">
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={roomData.status === "waiting" ? "default" : "secondary"}
                  className="self-start sm:self-center"
                >
                  {roomData.status === "waiting" ? "Waiting for Players" : "In Game"}
                </Badge>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6 sm:py-8">
            {/* Players List */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Players List */}
              <div className="order-1 lg:order-none lg:col-span-2">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5" />
                          Players ({players.length}/{roomData.maxPlayers})
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {allPlayersReady ? "All players ready!" : "Waiting for players to get ready..."}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                              <AvatarImage src={player.avatar || "/placeholder.svg"} alt={player.username} />
                              <AvatarFallback className="text-xs sm:text-sm">
                                {player.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm sm:text-base truncate">
                                  {player.username}
                                </span>
                                {player.isHost && <Crown className="h-4 w-4 text-primary flex-shrink-0" aria-label="Host" />}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {player.username === currentUser ? "You" : "Player"}
                              </div>
                            </div>
                          </div>
                          <Badge variant={player.isReady ? "default" : "secondary"} className="text-xs flex-shrink-0">
                            {player.isReady ? "Ready" : "Not Ready"}
                          </Badge>
                        </div>
                      ))}

                      {/* Empty slots */}
                      {Array.from({ length: roomData.maxPlayers - players.length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex items-center gap-3 p-3 sm:p-4 border border-dashed border-border rounded-lg opacity-50"
                        >
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="text-xs sm:text-sm">?</AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-sm sm:text-base">Waiting for player...</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Room Info & Controls */}
              <div className="order-2 lg:order-none space-y-4 sm:space-y-6">
                {/* Game Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" />
                      Game Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Difficulty:</span>
                      <span className="font-medium text-sm">{roomData.settings.difficulty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Time Limit:</span>
                      <span className="font-medium text-sm">{roomData.settings.timeLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Map:</span>
                      <span className="font-medium text-sm truncate ml-2">{roomData.settings.map}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Game Controls */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Game Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isHost ? (
                      <>
                        <Button
                          onClick={handleStartGame}
                          disabled={!allPlayersReady}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          size="lg"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {allPlayersReady ? "Start Game" : "Waiting for Players"}
                        </Button>
                        {!allPlayersReady && (
                          <p className="text-xs sm:text-sm text-muted-foreground text-center">
                            All players must be ready before starting
                          </p>
                        )}
                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Room Settings</span>
                          <span className="sm:hidden">Settings</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleToggleReady}
                          variant={isReady ? "secondary" : "default"}
                          className="w-full"
                          size="lg"
                        >
                          {isReady ? "Ready!" : "Get Ready"}
                        </Button>
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs sm:text-sm">Waiting for host to start game...</span>
                          </div>
                          {!allPlayersReady && (
                            <p className="text-xs text-muted-foreground">Some players are not ready yet</p>
                          )}
                        </div>
                      </>
                    )}

                    <Separator />

                    <Button variant="destructive" onClick={handleLeaveRoom} className="w-full" size="sm">
                      Leave Room
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
