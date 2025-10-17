"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  Users,
  Trophy,
  ArrowLeft,
  QrCode,
  X,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

// Mock game data
const mockGameData = {
  id: "1",
  name: "Epic Battle Arena",
  gameMode: "Battle Royale",
  status: "in-progress",
}

const mockPlayers = [
  { id: "1", username: "PlayerOne", score: 1250, health: 85, isAlive: true, kills: 3 },
  { id: "2", username: "ShadowHunter", score: 980, health: 60, isAlive: true, kills: 2 },
  { id: "3", username: "FireStorm", score: 750, health: 0, isAlive: false, kills: 1 },
  { id: "4", username: "IceQueen", score: 1100, health: 95, isAlive: true, kills: 4 },
]

export default function GameInterfacePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [gameData, setGameData] = useState(mockGameData)
  const [players, setPlayers] = useState(mockPlayers)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasLeftGame, setHasLeftGame] = useState(false)
  const [isScannerVisible, setIsScannerVisible] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  const gameId = params?.id as string

  // Check game access authorization
  useEffect(() => {
    // Skip authorization check if user has explicitly left
    if (hasLeftGame) {
      console.log('⏭️  Skipping authorization check - user has left game')
      return
    }

    const checkGameAccess = async () => {
      if (!user?.id || !gameId) return

      console.log(`🔍 Checking game access for user ${user.id} in game ${gameId}`)

      try {
        const response = await fetch(`/api/games/${gameId}/access?user_id=${user.id}`)
        const data = await response.json()
        
        if (data.authorized) {
          console.log('✅ User authorized for game access')
          setIsAuthorized(true)
        } else {
          console.log('❌ User not authorized:', data.message)
          setIsAuthorized(false)
          setAuthError(data.message || 'You are not authorized to access this game')
        }
      } catch (error) {
        console.error('Error checking game access:', error)
        setIsAuthorized(false)
        setAuthError('Failed to verify game access')
      }
    }

    // Only check authorization if user is loaded and hasn't left
    if (user && !hasLeftGame) {
      checkGameAccess()
    }
  }, [user, gameId, hasLeftGame])

  const currentUser = user?.username || "PlayerOne"
  const currentPlayerData = players.find((p) => p.username === currentUser)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const handleLeaveGame = async () => {
    if (!user?.id || !gameId) return

    console.log(`🚪 User ${user.id} leaving game/room ${gameId}`)
    console.log(`📍 Current URL: ${window.location.href}`)

    // Mark that user has left to prevent authorization checks
    setHasLeftGame(true)
    
    // Navigate away immediately to prevent any re-checks
    console.log('🔀 Navigating to dashboard...')
    router.push('/dashboard')

    try {
      // Leave the room in the background (which removes player from room_players table)
      console.log(`📤 Sending leave request for room ${gameId}`)
      const response = await fetch(`/api/rooms/${gameId}/leave`, {
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
        console.log('✅ Successfully left game/room:', result)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to leave game:', errorData)
        // Even if API fails, user is already on dashboard
      }
    } catch (error) {
      console.error('💥 Error leaving game:', error)
      // Even if API fails, user is already on dashboard
    }
  }

  // QR Code Scanner handlers
  const handleScanQRCode = async () => {
    console.log('📷 Opening QR Code Scanner...')
    setIsScannerVisible(true)
    
    // Initialize QR scanner when button is clicked
    // This would activate the camera
    try {
      // TODO: Initialize your QR scanner library here
      // For example, using html5-qrcode or similar library
      console.log('🎥 Activating camera for QR scanning...')
    } catch (error) {
      console.error('Failed to start QR scanner:', error)
    }
  }

  const handleCloseScanner = () => {
    console.log('🔒 Closing QR Code Scanner...')
    setIsScannerVisible(false)
    // TODO: Stop the QR scanner and release camera
  }

  const handleQRCodeScanned = (data: string) => {
    console.log('✅ QR Code scanned:', data)
    setScannedData(data)
    setIsScannerVisible(false)
    // TODO: Process the scanned QR code data
    // For example, update score, unlock achievement, etc.
  }

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Verifying game access...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show unauthorized access error
  if (isAuthorized === false) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {authError || 'You do not have permission to access this game'}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You can only access games that you are participating in.
                </p>
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background flex flex-col">
        {/* QR Code Scanner Container */}
        <div 
          id="qr-scanner-container"
          ref={scannerContainerRef}
          className={`fixed inset-0 bg-black/98 backdrop-blur-lg z-50 flex items-center justify-center transition-all duration-500 ${
            isScannerVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div 
            className="w-full max-w-2xl mx-4 transform transition-all duration-500" 
            style={{ 
              transform: isScannerVisible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
              opacity: isScannerVisible ? 1 : 0
            }}
          >
            <Card className="border-none shadow-2xl bg-card/95 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none"></div>
              
              <CardHeader className="relative border-b border-border/50 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/60 rounded-2xl shadow-lg">
                      <QrCode className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        QR Code Scanner
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Scan to earn points</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleCloseScanner}
                    className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90 duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="relative p-8 space-y-6">
                {/* Camera preview area */}
                <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border-4 border-dashed border-primary/20 flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
                  <div className="relative text-center space-y-4 p-8">
                    <div className="relative inline-block">
                      <QrCode className="h-24 w-24 mx-auto text-primary drop-shadow-2xl animate-pulse" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                      {/* Scanning corners */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">Activate Camera</p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Position the QR code within the frame to scan automatically
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Scanned result */}
                {scannedData && (
                  <div className="relative p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl backdrop-blur-sm animate-in slide-in-from-bottom shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <p className="text-base font-bold text-green-600">Successfully Scanned!</p>
                    </div>
                    <div className="bg-background/60 rounded-lg p-3 border border-green-500/20">
                      <p className="text-xs text-muted-foreground font-mono break-all">{scannedData}</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleCloseScanner}
                  className="w-full h-14 text-base font-semibold rounded-xl border-2 hover:bg-muted/50 transition-all"
                >
                  Close Scanner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Header */}
        <header className="bg-card/60 backdrop-blur-xl border-b border-border/50 shadow-lg sticky top-0 z-40">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleLeaveGame} 
                  className="group border-2 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Leave Game
                </Button>
                <div>
                  <h1 className="font-bold text-foreground text-xl sm:text-2xl tracking-tight">{gameData.name}</h1>
                  <Badge className="mt-2 bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/30 hover:from-primary/30 hover:to-purple-500/30 transition-all">
                    {gameData.gameMode}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-24">
          <div className="h-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Scoreboard Section */}
              <Card id="scoreboard" className="group relative border-2 border-border/50 hover:border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <CardHeader className="relative bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-b-2 border-border/50 pb-5">
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg shadow-yellow-500/30">
                      <Trophy className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground">Scoreboard</div>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Top 5 players leading the game</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  {sortedPlayers.slice(0, 5).map((player, index) => (
                    <div
                      key={player.id}
                      className={`group/item relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 ${
                        player.username === currentUser 
                          ? "bg-gradient-to-r from-primary/25 via-primary/15 to-purple-500/25 border-2 border-primary/50 shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "bg-gradient-to-r from-muted/80 to-muted/40 hover:from-muted hover:to-muted/60 border-2 border-transparent hover:border-primary/20 hover:scale-[1.01] shadow-md hover:shadow-lg"
                      }`}
                    >
                      {/* Rank Medal */}
                      <div className={`absolute -left-3 -top-3 w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shadow-2xl border-4 border-background ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-yellow-500/50' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-gray-400/50' :
                        index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-orange-50 shadow-orange-500/50' :
                        'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary/40'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1 ml-6">
                        <Avatar className="h-14 w-14 border-4 border-background shadow-xl ring-2 ring-primary/20">
                          <AvatarFallback className="text-base font-black bg-gradient-to-br from-primary/30 to-purple-500/30 text-primary">
                            {player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className={`text-lg font-bold truncate flex items-center gap-2 ${
                            player.username === currentUser ? "text-primary" : "text-foreground"
                          }`}>
                            {player.username}
                            {player.username === currentUser && (
                              <Badge className="bg-primary text-primary-foreground shadow-lg text-xs font-bold">YOU</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium mt-1">
                            💀 {player.kills} {player.kills === 1 ? 'kill' : 'kills'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          {player.score}
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">points</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Players List Section */}
              <Card id="player-list" className="group relative border-2 border-border/50 hover:border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <CardHeader className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b-2 border-border/50 pb-5">
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground">Players</div>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        💚 {players.filter((p) => p.isAlive).length} alive • 💔 {players.filter((p) => !p.isAlive).length} eliminated
                      </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground border-2 border-primary/30 text-base px-4 py-2 font-bold shadow-lg">
                      {players.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative p-6 space-y-3 max-h-[600px] overflow-y-auto">
                  {sortedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className={`group/item flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        player.username === currentUser 
                          ? "bg-gradient-to-r from-primary/25 via-primary/15 to-purple-500/25 border-2 border-primary/50 shadow-lg shadow-primary/20" 
                          : "bg-gradient-to-r from-muted/80 to-muted/40 hover:from-muted hover:to-muted/60 border-2 border-transparent hover:border-primary/20 hover:scale-[1.01] shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-4 border-background shadow-lg ring-2 ring-primary/20">
                          <AvatarFallback className="text-base font-black bg-gradient-to-br from-primary/30 to-purple-500/30 text-primary">
                            {player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {!player.isAlive && (
                          <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-background">
                            <X className="h-6 w-6 text-red-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <span className={`text-base font-bold truncate ${
                            player.username === currentUser ? "text-primary" : "text-foreground"
                          }`}>
                            {player.username}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium mt-1.5 flex items-center gap-2">
                          <span>💀 {player.kills} kills</span>
                          <span>•</span>
                          <span>⭐ {player.score} pts</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {player.isAlive ? (
                          <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-2 border-green-500/40 hover:from-green-500/30 hover:to-emerald-500/30 font-bold px-4 py-1.5 shadow-lg shadow-green-500/20">
                            ✓ Alive
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 border-2 border-red-500/40 font-bold px-4 py-1.5 shadow-lg shadow-red-500/20">
                            ✗ Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
            </div>
          </div>
        </main>

        {/* Footer Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-2xl z-40">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              {/* Center - Scan QR Button */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-8">
                <Button 
                  id="scan-qr-button"
                  onClick={handleScanQRCode}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-purple-600 hover:from-primary/90 hover:via-primary/80 hover:to-purple-500 shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/60 transition-all duration-300 group border-4 border-background hover:scale-110"
                >
                  <QrCode className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
