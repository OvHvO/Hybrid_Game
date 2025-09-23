"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function AuthPage() {
  const { login, signup, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoginLoading(true)

    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: loginData.username, 
          password: loginData.password
         }),
      });

      if (res.ok) {
        alert("Successfully Login！");
        // router.push("/dashboard")
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }      
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoginLoading(false)
    }
  }

  //   async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();

  //   const res = await fetch("/api/login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ username, password }),
  //   });

  //   if (res.ok) {
  //     alert("登录成功！");
  //     // 这里可以做跳转，比如 router.push("/dashboard")
  //   } else {
  //     const data = await res.json();
  //     setError(data.error || "登录失败");
  //   }
  // }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSignupLoading(true)

    try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            username: signupData.username, 
            password: signupData.password, 
            email: signupData.email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
        } else {
          alert("Successfully Sign Up！ Your user ID: " + data.userId);

          // //setSuccess("Registration successful! Your user ID: " + data.userId);
          // setSignupData({
          //   username: "",
          //   email: "",
          //   password: "",
          //   confirmPassword: "",
          // })
          // router.push("/dashboard")

        }
    } catch (err) {
      setError("Signup failed. Please try again.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  // const handleGitHubSignup = () => {
  //   // Placeholder for GitHub OAuth integration
  //   console.log("GitHub signup clicked")
  //   // In a real implementation, this would redirect to GitHub OAuth
  //   window.location.href = "https://github.com/login/oauth/authorize?client_id=your_client_id&scope=user:email"
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink/70 to-orange-500 flex items-start justify-center p-4 pt-16 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Link href="/">
          <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
            ← Back to Home
          </Button>
        </Link>
      </div>
      
      {/* This is the wave background */}
      {/* <div className="absolute bottom-0 left-0 w-full z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 md:h-32 lg:h-40">
          <path
            d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
            fill="#1C2321"
            opacity="0.8"
          />
          <path
            d="M0,80 C300,40 600,100 900,80 C1050,60 1150,100 1200,80 L1200,120 L0,120 Z"
            fill="#5E6572"
            opacity="0.6"
          />
          <path
            d="M0,100 C300,60 600,120 900,100 C1050,80 1150,120 1200,100 L1200,120 L0,120 Z"
            fill="#E6E49F"
            opacity="0.4"
          />
        </svg>
      </div> */}

      <div className="w-full max-w-md relative z-20 mt-20">
        {/* <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">GameHub</h1>
          <p className="text-muted-foreground">Join the ultimate multiplayer experience</p>
        </div> */}

        <div className="flex justify-center mb-6 animate-bounce">
          <svg
            width="120"
            height="120"
            viewBox="0 0 256 255"
            className="drop-shadow-2xl hover:scale-110 transition-transform duration-300"
          >
            <defs>
              <linearGradient x1="12.959%" y1="12.039%" x2="79.639%" y2="78.201%" id="a">
                <stop stopColor="#387EB8" offset="0%"></stop>
                <stop stopColor="#366994" offset="100%"></stop>
              </linearGradient>
              <linearGradient x1="19.128%" y1="20.579%" x2="90.742%" y2="88.429%" id="b">
                <stop stopColor="#FFE052" offset="0%"></stop>
                <stop stopColor="#FFC331" offset="100%"></stop>
              </linearGradient>
            </defs>
            <path
              d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z"
              fill="url(#a)"
            ></path>
            <path
              d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.519 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z"
              fill="url(#b)"
            ></path>
          </svg>
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4 animate-slide-up">
            <TabsTrigger value="login" className="text-sm font-medium transition-all duration-300 hover:scale-105">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-sm font-medium transition-all duration-300 hover:scale-105">
              Sign Up
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-shake">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <TabsContent value="login" className="animate-slide-in-left">
            <Card className="border-border transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center animate-fade-in-delay">Welcome Back</CardTitle>
                <CardDescription className="text-center animate-fade-in-delay-2">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2 animate-slide-up-delay">
                    <Label htmlFor="login-email">Username</Label>
                    <Input
                      id="login-email"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isLoginLoading}
                    />
                  </div>
                  <div className="space-y-2 animate-slide-up-delay-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isLoginLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up-delay-3"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  <div className="text-center animate-fade-in-delay-3">
                    <a
                      href="#"
                      className="text-sm text-accent hover:underline transition-all duration-300 hover:scale-105"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="animate-slide-in-right">
            <Card className="border-border transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center animate-fade-in-delay">Create Account</CardTitle>
                <CardDescription className="text-center animate-fade-in-delay-2">
                  Join thousands of players in epic multiplayer battles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleGitHubSignup}
                    variant="outline"
                    className="w-full border-border hover:bg-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up-delay bg-transparent"
                    disabled={isSignupLoading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 .268-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign up with GitHub
                  </Button>

                  <div className="relative animate-slide-up-delay-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>
                </div> */}

                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2 animate-slide-up-delay-3">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2 animate-slide-up-delay-3">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2 animate-slide-up-delay-4">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2 animate-slide-up-delay-5">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="w-full transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up-delay-6"
                    disabled={isSignupLoading}
                  >
                    {isSignupLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
