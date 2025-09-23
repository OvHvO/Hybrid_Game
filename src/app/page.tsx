"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Users, Gamepad2, Sparkles, Shield, Rocket } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <header className="w-full glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" className="text-white">
                  <path
                    fill="currentColor"
                    d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25c-.2 0-.37.09-.5.27-.14.18-.21.42-.21.72 0 .3.07.54.21.72.13.18.3.27.5.27.2 0 .37-.09.5-.27.14-.18.21-.42.21-.72 0-.3-.07-.54-.21-.72-.13-.18-.3-.27-.5-.27zm7.5-13.5c.2 0 .37-.09.5-.27.14-.18.21-.42.21-.72 0-.3-.07-.54-.21-.72-.13-.18-.3-.27-.5-.27-.2 0-.37.09-.5.27-.14.18-.21.42-.21.72 0 .3.07.54.21.72.13.18.3.27.5.27z"
                  />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PyGameHub
              </h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Features
            </Link>
            <Link href="#community" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Community
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/auth">
              <Button
                variant="outline"
                className="hover:scale-105 transition-all duration-200 bg-transparent border-primary/30 hover:border-primary text-sm sm:text-base"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(107,70,193,0.1),transparent_70%)]"></div>
        <div className="text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto relative z-10">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in border border-primary/20">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Powered by Python & AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-fade-in leading-tight">
              Epic Multiplayer Gaming
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-delay leading-relaxed">
              Experience the future of gaming with our Python-powered platform. Join millions of players in epic
              battles, tournaments, and adventures across multiple game modes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up">
            <Link href="/auth">
              <Button
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl w-full sm:w-auto"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Playing Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-all duration-200 border-2 bg-transparent border-primary/30 hover:border-primary hover:bg-primary/5 w-full sm:w-auto"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Join Community
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 animate-fade-in-delay-2">
            <div className="text-center space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="text-2xl sm:text-3xl font-bold text-primary">2.5M+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Active Players</div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-accent/10">
              <div className="text-2xl sm:text-3xl font-bold text-accent">100K+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Games Daily</div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="text-2xl sm:text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm sm:text-base text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose PyGameHub?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge Python technology for the ultimate gaming experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group p-6 sm:p-8 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Experience zero-lag gameplay with our optimized Python backend and real-time synchronization technology.
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Global Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with players worldwide, form teams, and participate in tournaments with our vibrant community.
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Secure & Fair</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced anti-cheat systems and secure infrastructure ensure fair play and protect your gaming
                experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-primary via-accent to-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Ready to Dominate?</h2>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
            Join millions of players already experiencing the future of multiplayer gaming. Your epic adventure starts
            now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-all duration-200 bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
              >
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Play Now - Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
                    <path
                      fill="currentColor"
                      d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25c-.2 0-.37.09-.5.27-.14.18-.21.42-.21.72 0 .3.07.54.21.72.13.18.3.27.5.27.2 0 .37-.09.5-.27.14-.18.21-.42.21-.72 0-.3-.07-.54-.21-.72-.13-.18-.3-.27-.5-.27zm7.5-13.5c.2 0 .37-.09.5-.27.14-.18.21-.42.21-.72 0-.3-.07-.54-.21-.72-.13-.18-.3-.27-.5-.27-.2 0-.37.09-.5.27-.14.18-.21.42-.21.72 0 .3.07.54.21.72.13.18.3.27.5.27z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">PyGameHub</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The next generation multiplayer gaming platform powered by Python technology and AI innovation.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Game</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/room/create"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Room
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Community</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/forums" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Forums
                </Link>
                <Link
                  href="/tournaments"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tournaments
                </Link>
                <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 PyGameHub. All rights reserved. Built with ❤️ and Python.
            </p>
          </div>
        </div>
      </footer>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="#6b46c1"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="#805ad5"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="#a855f7"
          ></path>
        </svg>
      </div>
    </div>
  )
}
