"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users, Clock, Play } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Mock data for game rooms
const mockGameRooms = [
  {
    id: 1,
    name: "Epic Battle Arena",
    host: "PlayerOne",
    players: 3,
    maxPlayers: 4,
    status: "waiting",
    gameMode: "Battle Royale",
  },
  {
    id: 2,
    name: "Speed Demons",
    host: "RacerX",
    players: 2,
    maxPlayers: 6,
    status: "waiting",
    gameMode: "Racing",
  },
  {
    id: 3,
    name: "Strategy Masters",
    host: "ChessKing",
    players: 4,
    maxPlayers: 4,
    status: "in-game",
    gameMode: "Strategy",
  },
  {
    id: 4,
    name: "Casual Fun",
    host: "FriendlyGamer",
    players: 1,
    maxPlayers: 8,
    status: "waiting",
    gameMode: "Party",
  },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomName, setRoomName] = useState("")

  const filteredRooms = mockGameRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.gameMode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      // TODO: Implement room creation logic
      console.log("Creating room:", roomName)
      setRoomName("")
      setShowCreateRoom(false)
      // Navigate to the created room
      router.push("/room/new-room-id")
    }
  }

  const handleJoinRoom = (roomId: number) => {
    // TODO: Implement join room logic
    console.log("Joining room:", roomId)
    router.push(`/room/${roomId}`)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          {/* Background waves */}
          <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1C2321" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#5E6572" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1C2321" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5E6572" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E6E49F" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E6E49F" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1C2321" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Wave layers */}
            <path d="M0,200 C300,150 600,250 1200,180 L1200,300 L0,300 Z" fill="url(#wave1)" />
            <path d="M0,220 C400,170 800,270 1200,200 L1200,300 L0,300 Z" fill="url(#wave2)" />
            <path d="M0,240 C200,190 1000,290 1200,220 L1200,300 L0,300 Z" fill="url(#wave3)" />
          </svg>
        </div>

        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">GameHub Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {user?.username}!</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/profile")}
                  className="text-xs sm:text-sm bg-transparent"
                >
                  Profile
                </Button>
                <Button variant="outline" size="sm" onClick={logout} className="text-xs sm:text-sm bg-transparent">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Main Actions */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                  <CardDescription className="text-sm">Start your gaming session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showCreateRoom ? (
                    <>
                      <Button
                        onClick={() => setShowCreateRoom(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base"
                        size="lg"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Create Game Room
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base" size="lg">
                        <Users className="mr-2 h-4 w-4" />
                        Quick Match
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter room name..."
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                        className="text-sm sm:text-base"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateRoom}
                          className="flex-1 bg-primary hover:bg-primary/90 text-sm sm:text-base"
                          disabled={!roomName.trim()}
                        >
                          Create
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateRoom(false)
                            setRoomName("")
                          }}
                          className="flex-1 text-sm sm:text-base"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Player Stats */}
              <Card className="mt-4 sm:mt-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">{user?.stats.gamesWon || 0}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Games Won</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-accent">{user?.stats.totalScore || 0}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Rooms List */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Available Game Rooms</CardTitle>
                      <CardDescription className="text-sm">
                        Join an existing room or browse active games
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-0"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="font-semibold text-foreground text-sm sm:text-base">{room.name}</h3>
                              <Badge variant={room.status === "waiting" ? "default" : "secondary"} className="text-xs">
                                {room.status === "waiting" ? "Waiting" : "In Game"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {room.gameMode}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Host: {room.host}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {room.players}/{room.maxPlayers} players
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinRoom(room.id)}
                            disabled={room.status === "in-game" || room.players >= room.maxPlayers}
                            variant={room.status === "waiting" ? "default" : "secondary"}
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            {room.status === "waiting" ? "Join Room" : "Spectate"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <Users className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">No rooms found matching your search.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
