import { NextRequest, NextResponse } from 'next/server'

// Emergency stop endpoint to help debug polling issues
export async function POST(request: NextRequest) {
  console.log('🚨 EMERGENCY STOP - All polling should cease')
  
  // You can add logic here to broadcast a "stop polling" message
  // to all active WebSocket connections if needed
  
  return NextResponse.json({
    message: 'Emergency stop signal sent - check server logs',
    timestamp: new Date().toISOString()
  })
}