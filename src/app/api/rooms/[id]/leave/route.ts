import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { sendRoomUpdate } from "../../../../../../pages/api/websocket";

// POST /api/rooms/[id]/leave - Leave a room by room ID and user ID
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

    // Check if user is in the room
    const roomPlayers = await query(
      `
      SELECT 
        rp.*,
        r.owner_id,
        r.status as room_status
      FROM room_players rp
      JOIN rooms r ON rp.room_id = r.room_id
      WHERE rp.room_id = ? AND rp.user_id = ?
      `,
      [roomId, user_id]
    );

    if (roomPlayers.length === 0) {
      return NextResponse.json(
        { error: "User is not in this room" },
        { status: 404 }
      );
    }

    const roomPlayer = roomPlayers[0];

    // Check if this is the room owner
    if (roomPlayer.user_id === roomPlayer.owner_id) {
      // If owner leaves, check if there are other players
      const otherPlayers = await query(
        "SELECT user_id FROM room_players WHERE room_id = ? AND user_id != ?",
        [roomId, user_id]
      );

      if (otherPlayers.length > 0) {
        // If game is in progress, end the game and delete the room
        // Owner leaving an active game means the game should end
        if (roomPlayer.room_status === 'playing') {
          console.log(`🎮 Owner leaving active game - deleting room ${roomId}`)
          await execute("DELETE FROM room_players WHERE room_id = ?", [roomId]);
          await execute("DELETE FROM rooms WHERE room_id = ?", [roomId]);

          return NextResponse.json({ 
            message: "Game ended. Room deleted as owner left.",
            room_deleted: true,
            game_ended: true
          });
        }
        
        // If room is just waiting, transfer ownership to the first player who joined
        const newOwner = otherPlayers[0];
        await execute(
          "UPDATE rooms SET owner_id = ? WHERE room_id = ?",
          [newOwner.user_id, roomId]
        );
        
        // Remove original owner from room_players
        await execute(
          "DELETE FROM room_players WHERE room_id = ? AND user_id = ?",
          [roomId, user_id]
        );

        return NextResponse.json({ 
          message: "Successfully left room. Ownership transferred.",
          new_owner_id: newOwner.user_id
        });
      } else {
        // No other players, delete the room entirely
        await execute("DELETE FROM room_players WHERE room_id = ?", [roomId]);
        await execute("DELETE FROM rooms WHERE room_id = ?", [roomId]);

        return NextResponse.json({ 
          message: "Successfully left room. Room deleted as it was empty.",
          room_deleted: true
        });
      }
    } else {
      // Regular player leaving
      await execute(
        "DELETE FROM room_players WHERE room_id = ? AND user_id = ?",
        [roomId, user_id]
      );

      // Send WebSocket update to remaining players
      await sendRoomUpdate(roomId.toString());

      // Check if room is now empty (only owner remains)
      const remainingPlayers = await query(
        "SELECT COUNT(*) as count FROM room_players WHERE room_id = ?",
        [roomId]
      );

      return NextResponse.json({ 
        message: "Successfully left room",
        players_remaining: remainingPlayers[0].count
      });
    }
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}