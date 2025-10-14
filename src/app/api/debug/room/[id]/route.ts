import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/debug/room/[id] - Debug room data
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

    // Get room info
    const rooms = await query(
      `
      SELECT 
        r.room_id, 
        r.room_code, 
        r.status, 
        r.created_at, 
        r.owner_id,
        u.username as owner_username
      FROM rooms r
      JOIN users u ON r.owner_id = u.user_id
      WHERE r.room_id = ?
      `,
      [roomId]
    );

    // Get all room players
    const players = await query(
      `
      SELECT 
        rp.id,
        rp.room_id,
        rp.user_id,
        rp.joined_at,
        u.username
      FROM room_players rp
      JOIN users u ON rp.user_id = u.user_id
      WHERE rp.room_id = ?
      ORDER BY rp.joined_at ASC
      `,
      [roomId]
    );

    // Get player count
    const countResult = await query(
      "SELECT COUNT(*) as count FROM room_players WHERE room_id = ?",
      [roomId]
    );

    return NextResponse.json({
      room: rooms[0] || null,
      players: players,
      player_count: countResult[0]?.count || 0,
      debug_info: {
        room_exists: rooms.length > 0,
        players_found: players.length,
        raw_count: countResult[0]?.count
      }
    });

  } catch (error) {
    console.error("Debug room error:", error);
    return NextResponse.json(
      { error: "Failed to debug room", details: error },
      { status: 500 }
    );
  }
}