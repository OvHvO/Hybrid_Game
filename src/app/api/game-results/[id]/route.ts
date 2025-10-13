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

// GET /api/game-results/[id] - Get specific game result
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resultId = parseInt(params.id);

    if (isNaN(resultId)) {
      return NextResponse.json(
        { error: "Invalid result ID" },
        { status: 400 }
      );
    }

    const gameResults = await query(
      `
      SELECT 
        gr.*,
        u.username,
        r.room_code
      FROM game_results gr
      JOIN users u ON gr.user_id = u.user_id
      JOIN rooms r ON gr.room_id = r.room_id
      WHERE gr.result_id = ?
      `,
      [resultId]
    );

    if (gameResults.length === 0) {
      return NextResponse.json(
        { error: "Game result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ gameResult: gameResults[0] });
  } catch (error) {
    console.error("Get game result error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game result" },
      { status: 500 }
    );
  }
}

// PUT /api/game-results/[id] - Update game result
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resultId = parseInt(params.id);
    const { score, result } = await request.json();

    if (isNaN(resultId)) {
      return NextResponse.json(
        { error: "Invalid result ID" },
        { status: 400 }
      );
    }

    // Check if game result exists
    const existingResults = await query<GameResult>(
      "SELECT * FROM game_results WHERE result_id = ?",
      [resultId]
    );

    if (existingResults.length === 0) {
      return NextResponse.json(
        { error: "Game result not found" },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (score !== undefined) {
      updates.push("score = ?");
      values.push(score);
    }

    if (result && ['win', 'lose', 'draw'].includes(result)) {
      updates.push("result = ?");
      values.push(result);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(resultId);

    await execute(
      `UPDATE game_results SET ${updates.join(', ')} WHERE result_id = ?`,
      values
    );

    return NextResponse.json({ message: "Game result updated successfully" });
  } catch (error) {
    console.error("Update game result error:", error);
    return NextResponse.json(
      { error: "Failed to update game result" },
      { status: 500 }
    );
  }
}

// DELETE /api/game-results/[id] - Delete game result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resultId = parseInt(params.id);

    if (isNaN(resultId)) {
      return NextResponse.json(
        { error: "Invalid result ID" },
        { status: 400 }
      );
    }

    // Check if game result exists
    const existingResults = await query<GameResult>(
      "SELECT * FROM game_results WHERE result_id = ?",
      [resultId]
    );

    if (existingResults.length === 0) {
      return NextResponse.json(
        { error: "Game result not found" },
        { status: 404 }
      );
    }

    // Delete game result
    await execute("DELETE FROM game_results WHERE result_id = ?", [resultId]);

    return NextResponse.json({ message: "Game result deleted successfully" });
  } catch (error) {
    console.error("Delete game result error:", error);
    return NextResponse.json(
      { error: "Failed to delete game result" },
      { status: 500 }
    );
  }
}