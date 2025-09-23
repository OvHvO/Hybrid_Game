"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  stats: {
    gamesWon: number
    totalScore: number
    gamesPlayed: number
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const sampleUsers = [
    {
      id: "1",
      username: "GameMaster",
      email: "admin@game.com",
      password: "admin123",
      avatar: "/gaming-avatar-1.png",
      stats: { gamesWon: 150, totalScore: 5000, gamesPlayed: 200 },
    },
    {
      id: "2",
      username: "PlayerOne",
      email: "player1@game.com",
      password: "player123",
      avatar: "/gaming-avatar-2.png",
      stats: { gamesWon: 42, totalScore: 1337, gamesPlayed: 89 },
    },
    {
      id: "3",
      username: "ProGamer",
      email: "pro@game.com",
      password: "pro123",
      avatar: "/gaming-avatar-3.png",
      stats: { gamesWon: 89, totalScore: 3500, gamesPlayed: 120 },
    },
  ]

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("gameHub_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

      const foundUser = sampleUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem("gameHub_user", JSON.stringify(userWithoutPassword))
        router.push("/dashboard")
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

      const existingUser = sampleUsers.find((u) => u.email === email)
      if (existingUser) {
        return false // Email already exists
      }

      // Mock signup validation
      if (username && email && password) {
        const newUser = {
          id: String(sampleUsers.length + 1),
          username,
          email,
          avatar: "/gaming-avatar-1.png",
          stats: { gamesWon: 0, totalScore: 0, gamesPlayed: 0 },
        }
        setUser(newUser)
        localStorage.setItem("gameHub_user", JSON.stringify(newUser))
        router.push("/dashboard")
        return true
      }
      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gameHub_user")
    router.push("/")
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
