import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/rooms/[id]/join - Check if room is joinable and get room info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id);

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

    return NextResponse.json({
      room: {
        ...room,
        joinable: room.status === 'waiting'
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
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id);
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