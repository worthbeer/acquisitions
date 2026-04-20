import 'dotenv/config';

let db, sql;

if (process.env.NODE_ENV === 'production') {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
} else {
    console.log('[db] using pg driver → ', process.env.DATABASE_URL);
    const { default: pg } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
    db = drizzle(pool);
}

export { db, sql };
