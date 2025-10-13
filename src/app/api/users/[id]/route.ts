import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import bcrypt from "bcrypt";

type User = {
  user_id: number;
  username: string;
  password: string;
  email: string | null;
  created_at: string;
};

// GET /api/users/[id] - Get user by ID
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

    const users = await query<Omit<User, 'password'>>(
      "SELECT user_id, username, email, created_at FROM users WHERE user_id = ?",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const { username, email, password } = await request.json();

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await query<User>(
      "SELECT * FROM users WHERE user_id = ?",
      [userId]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if new username/email is already taken by another user
    if (username || email) {
      const conflictUsers = await query<User>(
        "SELECT * FROM users WHERE (username = ? OR email = ?) AND user_id != ?",
        [username || '', email || '', userId]
      );

      if (conflictUsers.length > 0) {
        return NextResponse.json(
          { error: "Username or email already exists" },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password = ?");
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(userId);

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
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

    // Check if user exists
    const existingUsers = await query<User>(
      "SELECT * FROM users WHERE user_id = ?",
      [userId]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user (this should also cascade delete related records if foreign keys are set up)
    await execute("DELETE FROM users WHERE user_id = ?", [userId]);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}