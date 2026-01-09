import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Query wrapper
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query:', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

// Get client for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Transaction helper
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Close pool
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('🔌 PostgreSQL connection closed');
}

export { pool };
export default pool;
