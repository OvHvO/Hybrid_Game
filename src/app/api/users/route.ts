import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import bcrypt from "bcrypt";

// User type definition
type User = {
  user_id: number;
  username: string;
  password: string;
  email: string | null;
  created_at: string;
};

// GET /api/users - Get all users (with optional search)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = "SELECT user_id, username, email, created_at FROM users";
    const values: any[] = [];

    if (search) {
      sql += " WHERE username LIKE ? OR email LIKE ?";
      values.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    values.push(limit, offset);

    const users = await query<Omit<User, 'password'>>(sql, values);

    return NextResponse.json({
      users,
      pagination: {
        limit,
        offset,
        total: users.length
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (registration)
export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query<User>(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email || null]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await execute(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email || null]
    );

    const userId = (result as any).insertId;

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId,
        user: { username, email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}