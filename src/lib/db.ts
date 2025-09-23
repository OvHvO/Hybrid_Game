import mysql, { Pool } from "mysql2/promise";
import { ResultSetHeader } from "mysql2/promise";

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
});

export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, values);
  return rows as T[];
}

export async function execute<T = ResultSetHeader>(sql: string, values?: any[]): Promise<T> {
  const [result] = await pool.execute(sql, values);
  return result as T;
}

export default pool;