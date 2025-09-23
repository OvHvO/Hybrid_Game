import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query, execute} from "@/lib/db"; // The database utility

export async function POST(req: Request) {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Check if the username already exists
    const existingUsers = await query("SELECT * FROM users WHERE username = ? OR email = ?", [
      username,
      email || null,
    ]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Username or email already taken" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user
    const result = await execute(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email || null]
    );

    return NextResponse.json({
      message: "User registered successfully",
      userId: result.insertId, // MySQL returns the ID of the newly inserted user
    });
    
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
