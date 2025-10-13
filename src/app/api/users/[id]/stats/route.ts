import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/users/[id]/stats - Get user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Verify user exists
    const users = await query("SELECT user_id, username FROM users WHERE user_id = ?", [userId]);
    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get comprehensive stats
    const [
      totalGames,
      winStats,
      loseStats,
      drawStats,
      scoreStats,
      recentGames
    ] = await Promise.all([
      // Total games played
      query("SELECT COUNT(*) as total FROM game_results WHERE user_id = ?", [userId]),
      
      // Win count
      query("SELECT COUNT(*) as wins FROM game_results WHERE user_id = ? AND result = 'win'", [userId]),
      
      // Loss count  
      query("SELECT COUNT(*) as losses FROM game_results WHERE user_id = ? AND result = 'lose'", [userId]),
      
      // Draw count
      query("SELECT COUNT(*) as draws FROM game_results WHERE user_id = ? AND result = 'draw'", [userId]),
      
      // Score statistics
      query(`
        SELECT 
          AVG(score) as avg_score,
          MAX(score) as max_score,
          MIN(score) as min_score,
          SUM(score) as total_score
        FROM game_results 
        WHERE user_id = ?
      `, [userId]),
      
      // Recent 5 games
      query(`
        SELECT 
          gr.result,
          gr.score,
          gr.finished_at,
          r.room_code
        FROM game_results gr
        JOIN rooms r ON gr.room_id = r.room_id
        WHERE gr.user_id = ?
        ORDER BY gr.finished_at DESC
        LIMIT 5
      `, [userId])
    ]);

    const stats = {
      user: {
        user_id: user.user_id,
        username: user.username
      },
      games: {
        total: totalGames[0]?.total || 0,
        wins: winStats[0]?.wins || 0,
        losses: loseStats[0]?.losses || 0,
        draws: drawStats[0]?.draws || 0,
      },
      scores: {
        total: parseInt(scoreStats[0]?.total_score) || 0,
        average: parseFloat(scoreStats[0]?.avg_score) || 0,
        highest: parseInt(scoreStats[0]?.max_score) || 0,
        lowest: parseInt(scoreStats[0]?.min_score) || 0,
      },
      winRate: totalGames[0]?.total > 0 
        ? ((winStats[0]?.wins || 0) / totalGames[0].total * 100).toFixed(2)
        : "0.00",
      recentGames: recentGames || []
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}