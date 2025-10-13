import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { nanoid } from "nanoid";

type Room = {
  room_id: number;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  owner_id: number;
};

type RoomWithDetails = Room & {
  owner_username: string;
  player_count: number;
  players: Array<{
    user_id: number;
    username: string;
    joined_at: string;
  }>;
};

// GET /api/rooms - Get all rooms with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'waiting' | 'playing' | 'finished' | null;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
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
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];

    if (status) {
      conditions.push("r.status = ?");
      values.push(status);
    }

    if (search) {
      conditions.push("(r.room_code LIKE ? OR u.username LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += `
      GROUP BY r.room_id, r.room_code, r.status, r.created_at, r.owner_id, u.username
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    values.push(limit, offset);

    const rooms = await query<RoomWithDetails>(sql, values);

    // Get players for each room
    for (const room of rooms) {
      const players = await query<{user_id: number; username: string; joined_at: string}>(
        `
        SELECT rp.user_id, u.username, rp.joined_at
        FROM room_players rp
        JOIN users u ON rp.user_id = u.user_id
        WHERE rp.room_id = ?
        ORDER BY rp.joined_at ASC
        `,
        [room.room_id]
      );
      room.players = players;
    }

    return NextResponse.json({
      rooms,
      pagination: {
        limit,
        offset,
        total: rooms.length
      }
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    const { owner_id } = await request.json();

    if (!owner_id) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      );
    }

    // Verify owner exists
    const users = await query("SELECT user_id FROM users WHERE user_id = ?", [owner_id]);
    if (users.length === 0) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }

    // Generate unique room code
    let roomCode: string;
    let isUnique = false;
    
    do {
      roomCode = nanoid(8).toUpperCase();
      const existingRooms = await query("SELECT room_code FROM rooms WHERE room_code = ?", [roomCode]);
      isUnique = existingRooms.length === 0;
    } while (!isUnique);

    // Create room
    const result = await execute(
      "INSERT INTO rooms (room_code, owner_id, status) VALUES (?, ?, 'waiting')",
      [roomCode, owner_id]
    );

    const roomId = (result as any).insertId;

    // Add owner to room_players
    await execute(
      "INSERT INTO room_players (room_id, user_id) VALUES (?, ?)",
      [roomId, owner_id]
    );

    return NextResponse.json({
      message: "Room created successfully",
      room: {
        room_id: roomId,
        room_code: roomCode,
        owner_id,
        status: 'waiting'
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}