"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  MessageCircle,
  Users,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowLeft,
  Send,
  Target,
  Heart,
  Shield,
  Zap,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

// Mock game data
const mockGameData = {
  id: "1",
  name: "Epic Battle Arena",
  gameMode: "Battle Royale",
  status: "in-progress",
  timeRemaining: 480, // 8 minutes in seconds
  maxTime: 600, // 10 minutes
}

const mockPlayers = [
  { id: "1", username: "PlayerOne", score: 1250, health: 85, isAlive: true, kills: 3 },
  { id: "2", username: "ShadowHunter", score: 980, health: 60, isAlive: true, kills: 2 },
  { id: "3", username: "FireStorm", score: 750, health: 0, isAlive: false, kills: 1 },
  { id: "4", username: "IceQueen", score: 1100, health: 95, isAlive: true, kills: 4 },
]

const mockChatMessages = [
  { id: 1, username: "PlayerOne", message: "Let's team up!", timestamp: "10:32" },
  { id: 2, username: "ShadowHunter", message: "Good game everyone!", timestamp: "10:33" },
  { id: 3, username: "IceQueen", message: "Watch out for the storm!", timestamp: "10:34" },
]

export default function GameInterfacePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [gameData, setGameData] = useState(mockGameData)
  const [players, setPlayers] = useState(mockPlayers)
  const [chatMessages, setChatMessages] = useState(mockChatMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const currentUser = user?.username || "PlayerOne"
  const currentPlayerData = players.find((p) => p.username === currentUser)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setGameData((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        username: currentUser,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setChatMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  const handleLeaveGame = () => {
    // TODO: Implement leave game logic
    console.log("Leaving game...")
    router.push("/dashboard")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Game Header */}
        <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLeaveGame}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Game
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-bold text-foreground">{gameData.name}</h1>
              <Badge variant="outline" className="text-xs">
                {gameData.gameMode}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Game Timer */}
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{formatTime(gameData.timeRemaining)}</div>
              <Progress value={(gameData.timeRemaining / gameData.maxTime) * 100} className="w-24 h-2" />
            </div>

            {/* Game Controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Main Game Area */}
          <div className="flex-1 flex flex-col">
            {/* Game Viewport */}
            <div className="flex-1 bg-muted relative overflow-hidden">
              {/* Placeholder game canvas */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-16 w-16 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Game Canvas</h2>
                    <p className="text-muted-foreground">Game rendering area - integrate your game engine here</p>
                  </div>
                </div>
              </div>

              {/* Game HUD Overlay */}
              <div className="absolute top-4 left-4 space-y-2">
                {currentPlayerData && (
                  <Card className="bg-card/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <Progress value={currentPlayerData.health} className="w-16 h-2" />
                          <span className="text-sm font-medium">{currentPlayerData.health}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">100</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">75</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Mini Leaderboard Toggle */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="bg-card/90 backdrop-blur-sm"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </div>

              {/* Mini Leaderboard */}
              {showLeaderboard && (
                <Card className="absolute top-16 right-4 w-64 bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Live Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sortedPlayers.slice(0, 4).map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center font-bold">#{index + 1}</span>
                          <span className={player.username === currentUser ? "font-bold text-primary" : ""}>
                            {player.username}
                          </span>
                          {!player.isAlive && (
                            <Badge variant="destructive" className="text-xs">
                              KO
                            </Badge>
                          )}
                        </div>
                        <span className="font-medium">{player.score}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Game Controls Bar */}
            <div className="bg-card border-t border-border p-4">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm">
                  Move
                </Button>
                <Button variant="outline" size="sm">
                  Attack
                </Button>
                <Button variant="outline" size="sm">
                  Defend
                </Button>
                <Button variant="outline" size="sm">
                  Special
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm">
                  Inventory
                </Button>
                <Button variant="outline" size="sm">
                  Map
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {/* Players List */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Players ({players.filter((p) => p.isAlive).length}/{players.length} alive)
              </h3>
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      player.username === currentUser ? "bg-primary/10" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{player.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          #{index + 1} {player.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.kills} kills • {player.score} pts
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {player.isAlive ? (
                        <Badge variant="default" className="text-xs">
                          Alive
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          KO
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Game Chat
                </h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{msg.username}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="text-sm text-foreground bg-muted/50 rounded-lg p-2">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
