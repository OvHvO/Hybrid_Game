import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/leaderboard - Get leaderboard with various sorting options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'wins'; // wins, score, win_rate, recent
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orderClause = "";
    
    switch (sortBy) {
      case 'wins':
        orderClause = "wins DESC, total_score DESC";
        break;
      case 'score':
        orderClause = "total_score DESC, wins DESC";
        break;
      case 'win_rate':
        orderClause = "win_rate DESC, total_games DESC";
        break;
      case 'recent':
        orderClause = "last_game DESC";
        break;
      default:
        orderClause = "wins DESC, total_score DESC";
    }

    const leaderboard = await query(`
      SELECT 
        u.user_id,
        u.username,
        u.created_at,
        COALESCE(stats.total_games, 0) as total_games,
        COALESCE(stats.wins, 0) as wins,
        COALESCE(stats.losses, 0) as losses,
        COALESCE(stats.draws, 0) as draws,
        COALESCE(stats.total_score, 0) as total_score,
        COALESCE(stats.avg_score, 0) as avg_score,
        COALESCE(stats.max_score, 0) as max_score,
        CASE 
          WHEN COALESCE(stats.total_games, 0) = 0 THEN 0
          ELSE ROUND((COALESCE(stats.wins, 0) * 100.0) / stats.total_games, 2)
        END as win_rate,
        stats.last_game
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as total_games,
          SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
          SUM(score) as total_score,
          ROUND(AVG(score), 2) as avg_score,
          MAX(score) as max_score,
          MAX(finished_at) as last_game
        FROM game_results
        GROUP BY user_id
      ) stats ON u.user_id = stats.user_id
      WHERE COALESCE(stats.total_games, 0) > 0
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Add rank to each player
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      ...player,
      rank: offset + index + 1
    }));

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      pagination: {
        limit,
        offset,
        total: rankedLeaderboard.length
      },
      sortedBy: sortBy
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}