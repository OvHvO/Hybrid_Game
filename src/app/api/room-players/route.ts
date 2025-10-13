import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

type RoomPlayer = {
  id: number;
  room_id: number;
  user_id: number;
  joined_at: string;
};

// GET /api/room-players - Get room players with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const userId = searchParams.get('user_id');

    let sql = `
      SELECT 
        rp.id,
        rp.room_id,
        rp.user_id,
        rp.joined_at,
        u.username,
        r.room_code,
        r.status as room_status
      FROM room_players rp
      JOIN users u ON rp.user_id = u.user_id
      JOIN rooms r ON rp.room_id = r.room_id
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (roomId) {
      conditions.push("rp.room_id = ?");
      values.push(parseInt(roomId));
    }

    if (userId) {
      conditions.push("rp.user_id = ?");
      values.push(parseInt(userId));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY rp.joined_at ASC";

    const roomPlayers = await query(sql, values);

    return NextResponse.json({ roomPlayers });
  } catch (error) {
    console.error("Get room players error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room players" },
      { status: 500 }
    );
  }
}

// POST /api/room-players - Join a room
export async function POST(request: NextRequest) {
  try {
    const { room_id, user_id } = await request.json();

    if (!room_id || !user_id) {
      return NextResponse.json(
        { error: "Room ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if room exists and is joinable
    const rooms = await query(
      "SELECT * FROM rooms WHERE room_id = ?",
      [room_id]
    );

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const room = rooms[0];

    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: "Room is not accepting new players" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already in the room
    const existingRoomPlayer = await query(
      "SELECT * FROM room_players WHERE room_id = ? AND user_id = ?",
      [room_id, user_id]
    );

    if (existingRoomPlayer.length > 0) {
      return NextResponse.json(
        { error: "User is already in this room" },
        { status: 409 }
      );
    }

    // Add user to room
    const result = await execute(
      "INSERT INTO room_players (room_id, user_id) VALUES (?, ?)",
      [room_id, user_id]
    );

    const roomPlayerId = (result as any).insertId;

    return NextResponse.json({
      message: "Successfully joined room",
      roomPlayer: {
        id: roomPlayerId,
        room_id,
        user_id,
        joined_at: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}