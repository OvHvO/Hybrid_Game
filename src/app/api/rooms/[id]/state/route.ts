// src/app/api/rooms/[id]/state/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db"; // 假设你的 db lib 在这里

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // 1. 在一个查询中获取房间信息
    const roomResult = await query(
      `
      SELECT 
        r.room_id, r.room_code, r.status, r.created_at, r.owner_id, 
        u.username as owner_username
      FROM rooms r 
      JOIN users u ON r.owner_id = u.user_id 
      WHERE r.room_id = ?
      `,
      [roomId]
    );

    if (roomResult.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 2. 在另一个查询中获取玩家列表
    const playersResult = await query(
      `
      SELECT rp.user_id, u.username, rp.joined_at 
      FROM room_players rp 
      JOIN users u ON rp.user_id = u.user_id 
      WHERE rp.room_id = ? 
      ORDER BY rp.joined_at ASC
      `,
      [roomId]
    );

    // 3. 在一个响应中合并并返回
    return NextResponse.json({
      room: { ...roomResult[0], player_count: playersResult.length }, // 动态计算 player_count
      players: playersResult,
    });

  } catch (error) {
    console.error("Get room state error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room state" },
      { status: 500 }
    );
  }
}