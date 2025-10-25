import { NextApiRequest, NextApiResponse } from 'next'
import { query, execute } from "@/lib/db"
import { sendRoomUpdate } from '../../websocket'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { id } = req.query
    const roomId = parseInt(id as string)
    const { user_id } = req.body

    if (isNaN(roomId)) {
      return res.status(400).json({ error: "Invalid room ID" })
    }
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" })
    }

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
    )

    if (roomPlayers.length === 0) {
      return res.status(404).json({ error: "User is not in this room" })
    }

    const roomPlayer = roomPlayers[0]

    // Check if user is the room owner
    if (roomPlayer.user_id === roomPlayer.owner_id) {
      // Owner is leaving
      const otherPlayers = await query(
        "SELECT user_id FROM room_players WHERE room_id = ? AND user_id != ?",
        [roomId, user_id]
      )

      if (otherPlayers.length > 0) {
        // --- This is the new logic ---
        // If there are other players, notify them
        console.log(`🎮 Owner leaving. Notifying players and closing room ${roomId}`);

        // 1. Set status to "closed" so clients can detect this change
        await execute(
          "UPDATE rooms SET status = 'closed' WHERE room_id = ?",
          [roomId]
        );

        // 2. Send final WebSocket update immediately
        // Players still in room (room/page.tsx) will receive this update
        await sendRoomUpdate(roomId.toString());

        // 3. Brief delay to ensure WebSocket message has time to send
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

        // 4. Clean up room (delete all players and room itself)
        await execute("DELETE FROM room_players WHERE room_id = ?", [roomId]);
        await execute("DELETE FROM rooms WHERE room_id = ?", [roomId]);

        return res.status(200).json({ 
          message: "Owner left. Room closed and deleted.",
          room_deleted: true
        });
        // --- End of new logic ---

      } else {
        // No other players, same as before, directly delete room
        console.log(`Owner leaving empty room ${roomId}. Deleting.`);
        await execute("DELETE FROM room_players WHERE room_id = ?", [roomId]);
        await execute("DELETE FROM rooms WHERE room_id = ?", [roomId]);

        return res.status(200).json({ 
          message: "Successfully left room. Room deleted as it was empty.",
          room_deleted: true
        });
      }
    } else {
      // Regular player leaving (logic unchanged)
      await execute(
        "DELETE FROM room_players WHERE room_id = ? AND user_id = ?",
        [roomId, user_id]
      )

      // Trigger WebSocket update
      await sendRoomUpdate(roomId.toString())

      const remainingPlayers = await query(
        "SELECT COUNT(*) as count FROM room_players WHERE room_id = ?",
        [roomId]
      );

      return res.status(200).json({ 
        message: "Successfully left room",
        players_remaining: remainingPlayers[0].count
      });
    }
  } catch (error) {
    console.error("Leave room error:", error)
    return res.status(500).json({ error: "Failed to leave room" })
  }
}