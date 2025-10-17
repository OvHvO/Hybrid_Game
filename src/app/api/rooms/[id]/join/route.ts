// /api/rooms/[id]/join/route.ts

import { NextRequest, NextResponse } from "next/server";
import { addPlayerToRoom, ApiError } from "@/lib/roomService"; // 导入新函数

// ... 你的 GET 函数保持不变 ...

// POST /api/rooms/[id]/join - Join room by room ID
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);
    const { user_id } = await request.json(); // 假设 user_id 来自 body

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

    // --- 删掉所有旧的验证 (check room capacity, check existing player) ---
    // --- 删掉所有 fetch 代码 ---

    // 唯一要做的事：调用你的核心逻辑函数
    const newPlayer = await addPlayerToRoom(roomId, user_id);

    // 成功！
    return NextResponse.json(newPlayer, { status: 201 });

  } catch (error) {
    console.error("Join room by ID error:", error);

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