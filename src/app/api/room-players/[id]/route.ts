import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

// DELETE /api/room-players/[id] - Leave a room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomPlayerId = parseInt(params.id);

    if (isNaN(roomPlayerId)) {
      return NextResponse.json(
        { error: "Invalid room player ID" },
        { status: 400 }
      );
    }

    // Check if room player record exists
    const roomPlayers = await query(
      `
      SELECT 
        rp.*,
        r.owner_id,
        r.status as room_status
      FROM room_players rp
      JOIN rooms r ON rp.room_id = r.room_id
      WHERE rp.id = ?
      `,
      [roomPlayerId]
    );

    if (roomPlayers.length === 0) {
      return NextResponse.json(
        { error: "Room player record not found" },
        { status: 404 }
      );
    }

    const roomPlayer = roomPlayers[0];

    // Check if this is the room owner
    if (roomPlayer.user_id === roomPlayer.owner_id) {
      return NextResponse.json(
        { error: "Room owner cannot leave the room. Delete the room instead." },
        { status: 400 }
      );
    }

    // Remove user from room
    await execute("DELETE FROM room_players WHERE id = ?", [roomPlayerId]);

    return NextResponse.json({ message: "Successfully left room" });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}