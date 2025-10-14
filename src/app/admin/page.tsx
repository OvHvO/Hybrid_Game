"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const [cleaning, setCleaning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCleanup = async () => {
    setCleaning(true)
    try {
      const response = await fetch('/api/rooms/cleanup', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Cleanup failed:', error)
      setResult({ error: 'Failed to cleanup rooms' })
    } finally {
      setCleaning(false)
    }
  }

  const checkCleanup = async () => {
    try {
      const response = await fetch('/api/rooms/cleanup')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Check failed:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Cleanup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clean up empty rooms that have been inactive for more than 5 minutes.
            </p>
            
            <div className="flex gap-4">
              <Button onClick={checkCleanup} variant="outline">
                Check Empty Rooms
              </Button>
              <Button 
                onClick={handleCleanup} 
                disabled={cleaning}
                variant="destructive"
              >
                {cleaning ? 'Cleaning...' : 'Clean Up Now'}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}