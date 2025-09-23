import pool from "@/lib/db";

// GET /api/users  get all users
export async function GET() {
  const [rows] = await pool.query("SELECT user_id, username, email, created_at FROM users");
  return Response.json(rows);
}

// POST /api/users  create a new user
export async function POST(req) {
  const { username, password, email } = await req.json();
  await pool.query(
    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
    [username, password, email]
  );
  return Response.json({ message: "User created" });
}