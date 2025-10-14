import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

// POST /api/rooms/cleanup - Clean up empty rooms older than 5 minutes
export async function POST(request: NextRequest) {
  try {
    const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
    const cutoffTime = new Date(Date.now() - EMPTY_ROOM_TIMEOUT);

    // Find rooms with no players that are older than 5 minutes
    const emptyRooms = await query(
      `
      SELECT 
        r.room_id,
        r.room_code,
        r.created_at,
        COUNT(rp.user_id) as player_count
      FROM rooms r
      LEFT JOIN room_players rp ON r.room_id = rp.room_id
      WHERE r.created_at < ?
      GROUP BY r.room_id, r.room_code, r.created_at
      HAVING player_count = 0
      `,
      [cutoffTime.toISOString().slice(0, 19).replace('T', ' ')]
    );

    if (emptyRooms.length === 0) {
      return NextResponse.json({ 
        message: "No empty rooms to clean up",
        deleted_count: 0
      });
    }

    // Delete empty rooms
    const roomIds = emptyRooms.map(room => room.room_id);
    
    // Delete any remaining room_players records (should be none, but just in case)
    await execute(
      `DELETE FROM room_players WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
      roomIds
    );

    // Delete the rooms
    await execute(
      `DELETE FROM rooms WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
      roomIds
    );

    return NextResponse.json({ 
      message: `Successfully cleaned up ${emptyRooms.length} empty rooms`,
      deleted_count: emptyRooms.length,
      deleted_rooms: emptyRooms.map(r => ({ id: r.room_id, code: r.room_code }))
    });

  } catch (error) {
    console.error("Room cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup rooms" },
      { status: 500 }
    );
  }
}

// GET /api/rooms/cleanup - Check which rooms would be cleaned up (for debugging)
export async function GET(request: NextRequest) {
  try {
    const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
    const cutoffTime = new Date(Date.now() - EMPTY_ROOM_TIMEOUT);

    // Find rooms with no players that are older than 5 minutes
    const emptyRooms = await query(
      `
      SELECT 
        r.room_id,
        r.room_code,
        r.created_at,
        r.status,
        COUNT(rp.user_id) as player_count,
        TIMESTAMPDIFF(MINUTE, r.created_at, NOW()) as minutes_old
      FROM rooms r
      LEFT JOIN room_players rp ON r.room_id = rp.room_id
      WHERE r.created_at < ?
      GROUP BY r.room_id, r.room_code, r.created_at, r.status
      HAVING player_count = 0
      ORDER BY r.created_at ASC
      `,
      [cutoffTime.toISOString().slice(0, 19).replace('T', ' ')]
    );

    return NextResponse.json({ 
      empty_rooms_to_delete: emptyRooms,
      cutoff_time: cutoffTime.toISOString(),
      would_delete_count: emptyRooms.length
    });

  } catch (error) {
    console.error("Room cleanup check error:", error);
    return NextResponse.json(
      { error: "Failed to check cleanup status" },
      { status: 500 }
    );
  }
}