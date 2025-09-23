import pool from "@/lib/db";

// GET /api/users/:id  get user by id
export async function GET(req, { params }) {
  const { id } = params;
  const [rows] = await pool.query(
    "SELECT user_id, username, email, created_at FROM users WHERE user_id = ?",
    [id]
  );
  if (rows.length === 0) return new Response("User not found", { status: 404 });
  return Response.json(rows[0]);
}

// PUT /api/users/:id  update user by id
export async function PUT(req, { params }) {
  const { id } = params;
  const { username, email } = await req.json();
  await pool.query("UPDATE users SET email=? WHERE username=?", [email, username]);
  return Response.json({ message: "User updated" });
}

// // DELETE /api/users/:id  delete user by id
// export async function DELETE(req, { params }) {
//   const { id } = params;
//   await pool.query("DELETE FROM users WHERE user_id=?", [id]);
//   return Response.json({ message: "User deleted" });
// }
