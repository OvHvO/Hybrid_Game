import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/rooms/[id]/join - Check if room is joinable and get room info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);

    if (isNaN(roomId)) {
      return NextResponse.json(
        { error: "Invalid room ID" },
        { status: 400 }
      );
    }

    // Get room details with player count
    const rooms = await query(
      `
      SELECT 
        r.room_id,
        r.room_code,
        r.status,
        r.created_at,
        r.owner_id,
        u.username as owner_username,
        COUNT(rp.user_id) as player_count
      FROM rooms r
      JOIN users u ON r.owner_id = u.user_id
      LEFT JOIN room_players rp ON r.room_id = rp.room_id
      WHERE r.room_id = ?
      GROUP BY r.room_id, r.room_code, r.status, r.created_at, r.owner_id, u.username
      `,
      [roomId]
    );

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const room = rooms[0];
    const MAX_PLAYERS = 4;

    return NextResponse.json({
      room: {
        ...room,
        joinable: room.status === 'waiting' && room.player_count < MAX_PLAYERS,
        max_players: MAX_PLAYERS,
        is_full: room.player_count >= MAX_PLAYERS
      }
    });
  } catch (error) {
    console.error("Check room joinable error:", error);
    return NextResponse.json(
      { error: "Failed to check room status" },
      { status: 500 }
    );
  }
}

// POST /api/rooms/[id]/join - Join room by room ID
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);
    const { user_id } = await request.json();

    if (isNaN(roomId)) {
      return NextResponse.json(
        { error: "Invalid room ID" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check room capacity before joining
    const MAX_PLAYERS = 4;
    
    // Get current player count
    const roomCheck = await query(
      `
      SELECT 
        r.status,
        COUNT(rp.user_id) as current_players
      FROM rooms r
      LEFT JOIN room_players rp ON r.room_id = rp.room_id
      WHERE r.room_id = ?
      GROUP BY r.room_id, r.status
      `,
      [roomId]
    );

    if (roomCheck.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const room = roomCheck[0];

    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: "Room is not accepting new players" },
        { status: 400 }
      );
    }

    if (room.current_players >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: "Room is full (maximum 4 players)" },
        { status: 400 }
      );
    }

    // Check if user is already in the room
    const existingPlayer = await query(
      "SELECT id FROM room_players WHERE room_id = ? AND user_id = ?",
      [roomId, user_id]
    );

    if (existingPlayer.length > 0) {
      return NextResponse.json(
        { error: "User is already in this room" },
        { status: 400 }
      );
    }

    // Use the room-players API logic here
    const response = await fetch(`${request.nextUrl.origin}/api/room-players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_id: roomId,
        user_id
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Join room by ID error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}