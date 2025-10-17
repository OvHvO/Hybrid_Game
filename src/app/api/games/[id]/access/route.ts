import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params // This is actually the room_id for games
    
    // Get user_id from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', authorized: false },
        { status: 400 }
      )
    }

    // Check if room exists and is in 'playing' status
    const rooms = await query(
      'SELECT room_id, status FROM rooms WHERE room_id = ?',
      [gameId]
    )

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: 'Game/Room not found', authorized: false },
        { status: 404 }
      )
    }

    const room = rooms[0]

    // Game access requires room to be in 'playing' status
    if (room.status !== 'playing') {
      return NextResponse.json({
        authorized: false,
        room_status: room.status,
        message: `Game is not active. Room status: ${room.status}`
      })
    }

    // Check if user is the room owner (owners should always have access)
    const ownerRows = await query(
      'SELECT owner_id FROM rooms WHERE room_id = ? AND owner_id = ?',
      [gameId, userId]
    )

    const isOwner = ownerRows.length > 0

    // Check if user is a member of this room/game
    const memberRows = await query(
      'SELECT user_id FROM room_players WHERE room_id = ? AND user_id = ?',
      [gameId, userId]
    )

    const isMember = memberRows.length > 0
    const isAuthorized = isOwner || isMember

    return NextResponse.json({
      authorized: isAuthorized,
      room_status: room.status,
      is_owner: isOwner,
      is_member: isMember,
      message: isAuthorized
        ? (isOwner ? 'User is the room owner' : 'User is a member of this game')
        : 'User is not a member of this game'
    })

  } catch (error) {
    console.error('Error checking game access:', error)
    return NextResponse.json(
      { error: 'Internal server error', authorized: false },
      { status: 500 }
    )
  }
}