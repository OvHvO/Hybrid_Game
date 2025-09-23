"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, Target, Clock, Users, Star, Calendar, GamepadIcon } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Mock data for user profile
const mockGameHistory = [
  {
    id: 1,
    gameName: "Epic Battle Arena",
    result: "won",
    score: 2450,
    duration: "12m 34s",
    date: "2024-01-15",
    players: 4,
    rank: 1,
  },
  {
    id: 2,
    gameName: "Speed Demons",
    result: "lost",
    score: 1890,
    duration: "8m 12s",
    date: "2024-01-14",
    players: 6,
    rank: 4,
  },
  {
    id: 3,
    gameName: "Strategy Masters",
    result: "won",
    score: 3200,
    duration: "25m 45s",
    date: "2024-01-13",
    players: 4,
    rank: 1,
  },
  {
    id: 4,
    gameName: "Casual Fun",
    result: "won",
    score: 1650,
    duration: "15m 20s",
    date: "2024-01-12",
    players: 8,
    rank: 2,
  },
  {
    id: 5,
    gameName: "Epic Battle Arena",
    result: "lost",
    score: 1200,
    duration: "6m 45s",
    date: "2024-01-11",
    players: 4,
    rank: 3,
  },
]

const mockAchievements = [
  { id: 1, name: "First Victory", description: "Win your first game", unlocked: true, date: "2024-01-10" },
  { id: 2, name: "Speed Demon", description: "Win a race in under 5 minutes", unlocked: true, date: "2024-01-12" },
  { id: 3, name: "Strategic Mind", description: "Win 5 strategy games", unlocked: true, date: "2024-01-15" },
  { id: 4, name: "Social Player", description: "Play with 10 different players", unlocked: false, progress: 7 },
  { id: 5, name: "Champion", description: "Win 10 games in a row", unlocked: false, progress: 3 },
  { id: 6, name: "Master Gamer", description: "Reach 10,000 total score", unlocked: false, progress: 8750 },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const totalGames = mockGameHistory.length
  const gamesWon = mockGameHistory.filter((game) => game.result === "won").length
  const winRate = Math.round((gamesWon / totalGames) * 100)
  const totalScore = mockGameHistory.reduce((sum, game) => sum + game.score, 0)
  const averageScore = Math.round(totalScore / totalGames)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background waves */}
        <div className="fixed inset-0 pointer-events-none z-0">
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

            <path d="M0,200 C300,150 600,250 1200,180 L1200,300 L0,300 Z" fill="url(#wave1)" />
            <path d="M0,220 C400,170 800,270 1200,200 L1200,300 L0,300 Z" fill="url(#wave2)" />
            <path d="M0,240 C200,190 1000,290 1200,220 L1200,300 L0,300 Z" fill="url(#wave3)" />
          </svg>
        </div>

        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Player Profile</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{user?.username}'s gaming profile</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src="/gaming-avatar-1.png" alt={user?.username} />
                  <AvatarFallback className="text-lg font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{user?.username}</h2>
                  <p className="text-muted-foreground mb-4">Member since January 2024</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">{gamesWon}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Games Won</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-accent">{totalScore.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Score</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-500">{winRate}%</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-500">{totalGames}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Games</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Game History</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recent Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Win Rate</span>
                          <span>{winRate}%</span>
                        </div>
                        <Progress value={winRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Average Score</span>
                          <span>{averageScore.toLocaleString()}</span>
                        </div>
                        <Progress value={(averageScore / 3500) * 100} className="h-2" />
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Last 5 games:{" "}
                          {mockGameHistory
                            .slice(0, 5)
                            .map((game) => (game.result === "won" ? "W" : "L"))
                            .join(" - ")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Favorite Game Modes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GamepadIcon className="h-5 w-5" />
                      Favorite Game Modes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Battle Royale</span>
                        <Badge variant="default">Most Played</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Strategy</span>
                        <Badge variant="secondary">Highest Win Rate</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Racing</span>
                        <Badge variant="outline">Best Score</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Game History
                  </CardTitle>
                  <CardDescription>Your recent gaming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockGameHistory.map((game) => (
                      <div
                        key={game.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3 sm:gap-0"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm sm:text-base">{game.gameName}</h3>
                            <Badge variant={game.result === "won" ? "default" : "destructive"} className="text-xs">
                              {game.result === "won" ? "Victory" : "Defeat"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Rank #{game.rank}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {game.score.toLocaleString()} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {game.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {game.players} players
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(game.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Your gaming milestones and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {mockAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 border rounded-lg ${
                          achievement.unlocked ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              achievement.unlocked
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base mb-1">{achievement.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            {achievement.unlocked ? (
                              <Badge variant="default" className="text-xs">
                                Unlocked {new Date(achievement.date!).toLocaleDateString()}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>
                                    {achievement.progress}/
                                    {achievement.id === 4 ? 10 : achievement.id === 5 ? 10 : 10000}
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    achievement.id === 4
                                      ? (achievement.progress! / 10) * 100
                                      : achievement.id === 5
                                        ? (achievement.progress! / 10) * 100
                                        : (achievement.progress! / 10000) * 100
                                  }
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
