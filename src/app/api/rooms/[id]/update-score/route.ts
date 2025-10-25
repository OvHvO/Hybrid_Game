import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params
    const { user_id, score_increment } = await request.json()

    console.log(`🎯 Updating score for user ${user_id} in room ${roomId}, increment: ${score_increment}`)

    // Check if user already has a game result record
    const existingResult = await query(`
      SELECT result_id, score FROM game_results 
      WHERE room_id = ? AND user_id = ?
    `, [roomId, user_id])

    if (existingResult.length > 0) {
      // Update existing score
      const newScore = existingResult[0].score + score_increment
      await execute(`
        UPDATE game_results 
        SET score = ?, finished_at = CURRENT_TIMESTAMP 
        WHERE room_id = ? AND user_id = ?
      `, [newScore, roomId, user_id])
      
      console.log(`✅ Updated score to ${newScore} for user ${user_id}`)
    } else {
      // Create new game result record
      await execute(`
        INSERT INTO game_results (room_id, user_id, score, result, finished_at)
        VALUES (?, ?, ?, 'win', CURRENT_TIMESTAMP)
      `, [roomId, user_id, score_increment])
      
      console.log(`✅ Created new game result with score ${score_increment} for user ${user_id}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Score updated successfully' 
    })
  } catch (error) {
    console.error('❌ Error updating score:', error)
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    )
  }
}