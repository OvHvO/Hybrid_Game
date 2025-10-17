import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params
    
    // Get user_id from query parameters (should be sent from frontend)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    console.log(`Checking membership: Room ${roomId}, User ${userId}`)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', authorized: false },
        { status: 400 }
      )
    }

    // Check if room exists
    const rooms = await query(
      'SELECT room_id, status FROM rooms WHERE room_id = ?',
      [roomId]
    )

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', authorized: false },
        { status: 404 }
      )
    }

    const room = rooms[0]

    // Check if user is the room owner (owners should always have access)
    const ownerRows = await query(
      'SELECT owner_id FROM rooms WHERE room_id = ? AND owner_id = ?',
      [roomId, userId]
    )

    const isOwner = ownerRows.length > 0

    // Check if user is a member of this room
    const memberRows = await query(
      'SELECT user_id FROM room_players WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    )

    const isMember = memberRows.length > 0
    const isAuthorized = isOwner || isMember

    console.log(`Membership check results: isOwner=${isOwner}, isMember=${isMember}, isAuthorized=${isAuthorized}`)

    return NextResponse.json({
      authorized: isAuthorized,
      room_status: room.status,
      is_owner: isOwner,
      is_member: isMember,
      message: isAuthorized
        ? (isOwner ? 'User is the room owner' : 'User is a member of this room')
        : 'User is not a member of this room'
    })

  } catch (error) {
    console.error('Error checking room membership:', error)
    return NextResponse.json(
      { error: 'Internal server error', authorized: false },
      { status: 500 }
    )
  }
}