import { NextRequest, NextResponse } from 'next/server'

// Simple debug endpoint to check active connections
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  
  console.log(`🔍 Debug endpoint hit at ${timestamp}`)
  
  return NextResponse.json({
    message: 'Debug endpoint - check server logs',
    timestamp,
    note: 'This endpoint helps identify if there are background processes running'
  })
}