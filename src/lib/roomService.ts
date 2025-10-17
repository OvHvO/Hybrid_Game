// src/lib/roomService.ts

import { query, execute } from "@/lib/db";
import { sendRoomUpdate } from "../../pages/api/websocket"; // 调整这个导入路径

const MAX_PLAYERS = 4;

/**
 * 自定义错误类，用于在 API 路由中捕获并返回正确的 HTTP 状态码
 */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 核心业务逻辑：将一个玩家添加到一个房间
 * 这个函数包含了所有的验证
 */
export async function addPlayerToRoom(roomId: number, userId: number) {
  // 1. 检查房间是否存在、状态是否正确、是否已满
  // 我们可以在一个查询中完成大部分检查
  const roomCheck = await query(
    `
    SELECT 
      r.room_id,
      r.status,
      COUNT(rp.user_id) as current_players
    FROM rooms r
    LEFT JOIN room_players rp ON r.room_id = rp.room_id
    WHERE r.room_id = ?
    GROUP BY r.room_id, r.status
    `,
    [roomId]
  );

  if (roomCheck.length === 0) {
    throw new ApiError("Room not found", 404);
  }

  const room = roomCheck[0];

  if (room.status !== 'waiting') {
    throw new ApiError("Room is not accepting new players", 400); // 400 Bad Request 或 403 Forbidden
  }

  if (room.current_players >= MAX_PLAYERS) {
    throw new ApiError(`Room is full (maximum ${MAX_PLAYERS} players)`, 400); // 400 Bad Request
  }

  // 2. 检查用户是否存在（如果你的数据库外键没有自动处理）
  const users = await query(
    "SELECT user_id FROM users WHERE user_id = ?",
    [userId]
  );

  if (users.length === 0) {
    throw new ApiError("User not found", 404);
  }

  // 3. 检查用户是否已在房间
  const existingRoomPlayer = await query(
    "SELECT id FROM room_players WHERE room_id = ? AND user_id = ?",
    [roomId, userId]
  );

  if (existingRoomPlayer.length > 0) {
    // 这种情况不是一个真正的“错误”，更像是一个“冲突”
    throw new ApiError("User is already in this room", 409); // 409 Conflict
  }

  // 4. 所有检查通过：添加用户到房间
  const result = await execute(
    "INSERT INTO room_players (room_id, user_id) VALUES (?, ?)",
    [roomId, userId]
  );

  const roomPlayerId = (result as any).insertId;

  // 5. 发送 WebSocket 更新
  await sendRoomUpdate(roomId.toString());

  // 6. 返回成功创建的玩家对象
  const newPlayer = {
    id: roomPlayerId,
    room_id: roomId,
    user_id: userId,
    joined_at: new Date().toISOString()
  };

  return newPlayer;
}