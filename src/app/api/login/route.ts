import { NextResponse } from "next/server";
import { query } from "@/lib/db";  // The database utility
import bcrypt from "bcrypt";

// User type
type User = {
  user_id: number;
  username: string;
  password: string; // hashed password
  email: string;
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Search for the user in the database
    const users = await query<User>("SELECT * FROM users WHERE username = ?", [username]);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Here you can generate JWT / set Session / return user information
    return NextResponse.json({ message: "Login successful", userId: user.user_id });
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
