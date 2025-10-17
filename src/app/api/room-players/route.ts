// /api/room-players/route.ts

import { NextRequest, NextResponse } from "next/server";
import { addPlayerToRoom, ApiError } from "@/lib/roomService"; // 导入新函数
// ... 你的其他导入 ...

// ... 你的 GET 函数保持不变 ...

// POST /api/room-players - Join a room
export async function POST(request: NextRequest) {
  try {
    const { room_id, user_id } = await request.json();

    if (!room_id || !user_id) {
      return NextResponse.json(
        { error: "Room ID and User ID are required" },
        { status: 400 }
      );
    }
    
    // --- 删掉所有旧的验证 (check room, check user, check existing player) ---
    // --- 删掉所有 INSERT 和 sendRoomUpdate 代码 ---

    // 唯一要做的事：调用你的核心逻辑函数
    const newPlayer = await addPlayerToRoom(room_id, user_id);

    // 成功！
    return NextResponse.json(newPlayer, { status: 201 });

  } catch (error) {
    console.error("Join room error:", error);
    
    // 捕获我们自定义的 ApiError 并返回正确的状态码
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // 捕获所有其他未知错误
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}