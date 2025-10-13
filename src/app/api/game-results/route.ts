import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

type GameResult = {
  result_id: number;
  room_id: number;
  user_id: number;
  score: number;
  result: 'win' | 'lose' | 'draw';
  finished_at: string;
};

type GameResultWithDetails = GameResult & {
  username: string;
  room_code: string;
};

// GET /api/game-results - Get game results with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const userId = searchParams.get('user_id');
    const result = searchParams.get('result') as 'win' | 'lose' | 'draw' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT 
        gr.*,
        u.username,
        r.room_code
      FROM game_results gr
      JOIN users u ON gr.user_id = u.user_id
      JOIN rooms r ON gr.room_id = r.room_id
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (roomId) {
      conditions.push("gr.room_id = ?");
      values.push(parseInt(roomId));
    }

    if (userId) {
      conditions.push("gr.user_id = ?");
      values.push(parseInt(userId));
    }

    if (result && ['win', 'lose', 'draw'].includes(result)) {
      conditions.push("gr.result = ?");
      values.push(result);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY gr.finished_at DESC LIMIT ? OFFSET ?";
    values.push(limit, offset);

    const gameResults = await query<GameResultWithDetails>(sql, values);

    return NextResponse.json({
      gameResults,
      pagination: {
        limit,
        offset,
        total: gameResults.length
      }
    });
  } catch (error) {
    console.error("Get game results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}

// POST /api/game-results - Record new game result
export async function POST(request: NextRequest) {
  try {
    const { room_id, user_id, score, result } = await request.json();

    if (!room_id || !user_id || result === undefined) {
      return NextResponse.json(
        { error: "Room ID, User ID, and result are required" },
        { status: 400 }
      );
    }

    if (!['win', 'lose', 'draw'].includes(result)) {
      return NextResponse.json(
        { error: "Result must be 'win', 'lose', or 'draw'" },
        { status: 400 }
      );
    }

    // Verify room exists
    const rooms = await query("SELECT room_id FROM rooms WHERE room_id = ?", [room_id]);
    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Verify user exists
    const users = await query("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user was in the room
    const roomPlayers = await query(
      "SELECT * FROM room_players WHERE room_id = ? AND user_id = ?",
      [room_id, user_id]
    );

    if (roomPlayers.length === 0) {
      return NextResponse.json(
        { error: "User was not in this room" },
        { status: 400 }
      );
    }

    // Record game result
    const insertResult = await execute(
      "INSERT INTO game_results (room_id, user_id, score, result) VALUES (?, ?, ?, ?)",
      [room_id, user_id, score || 0, result]
    );

    const resultId = (insertResult as any).insertId;

    return NextResponse.json({
      message: "Game result recorded successfully",
      gameResult: {
        result_id: resultId,
        room_id,
        user_id,
        score: score || 0,
        result,
        finished_at: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Record game result error:", error);
    return NextResponse.json(
      { error: "Failed to record game result" },
      { status: 500 }
    );
  }
}