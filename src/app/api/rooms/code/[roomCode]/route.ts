import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/rooms/code/[roomCode] - Find room by room code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode: code } = await params;
    const roomCode = code.toUpperCase();

    if (!roomCode || roomCode.length < 4) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    // Get room details with owner info and player count
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
      WHERE r.room_code = ?
      GROUP BY r.room_id, r.room_code, r.status, r.created_at, r.owner_id, u.username
      `,
      [roomCode]
    );

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const room = rooms[0];

    // Get all players in the room
    const players = await query(
      `
      SELECT rp.user_id, u.username, rp.joined_at
      FROM room_players rp
      JOIN users u ON rp.user_id = u.user_id
      WHERE rp.room_id = ?
      ORDER BY rp.joined_at ASC
      `,
      [room.room_id]
    );

    return NextResponse.json({
      room: {
        ...room,
        players,
        joinable: room.status === 'waiting'
      }
    });
  } catch (error) {
    console.error("Find room by code error:", error);
    return NextResponse.json(
      { error: "Failed to find room" },
      { status: 500 }
    );
  }
}