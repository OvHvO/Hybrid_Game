// app/api/cron/route.js

import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // use the same database pool

// 
export const dynamic = 'force-dynamic';

// Use POST request for better security, GET might be cached or logged
export async function POST(request) {
  
  // --- 1. Security check ---
  // Get Authorization from request headers
  const authHeader = request.headers.get('authorization');
  
  // Check if 'Bearer' token matches the secret key in your .env.local
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // If not matched, immediately return 401 Unauthorized
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // --- 2. Execute cleanup logic ---
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('--- [Cron Job] Starting execution: cleaning expired rooms ---');

    // Same multi-table delete SQL
    const sql = `
      DELETE r, rp, gr
      FROM rooms AS r
      LEFT JOIN room_players AS rp ON r.room_id = rp.room_id
      LEFT JOIN game_results AS gr ON r.room_id = gr.room_id
      WHERE
        r.status != 'finished'
      AND
        r.created_at < DATE_SUB(NOW(), INTERVAL 10 HOUR);
    `;

    const [results] = await connection.execute(sql);

    if (results.affectedRows > 0) {
      console.log(`--- [Cron Job] Cleanup completed: ${results.affectedRows} rows were deleted. ---`);
    } else {
      console.log('--- [Cron Job] Execution completed: no rooms need to be cleaned. ---');
    }

    // Success, return 200
    return NextResponse.json({ 
      success: true, 
      affectedRows: results.affectedRows 
    });

  } catch (error) {
    console.error('--- [Cron Job] Error while cleaning rooms: ---', error);
    // Failure, return 500
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  
  } finally {
    // Always release connection no matter what
    if (connection) {
      connection.release();
    }
  }
}

// (If you're using Pages Router, the syntax would be like this)
/*
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { authorization } = req.headers;
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // ... try/catch/finally logic same as above ...
  // ... On success: res.status(200).json({ ... });
  // ... On failure: res.status(500).json({ ... });
}
*/