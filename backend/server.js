require('dotenv').config();
const { Client } = require('pg');
const app = require('./src/app');

const PORT       = process.env.PORT       || 5000;
const DB_NAME    = process.env.DB_NAME    || 'bookmarks_db';
const DB_HOST    = process.env.DB_HOST    || 'localhost';
const DB_PORT    = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER    = process.env.DB_USER    || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

/**
 * Ensures the target database exists.
 * Connects to the built-in 'postgres' maintenance DB first (safe on every
 * fresh PostgreSQL install), creates the app database if absent, then closes.
 */
const ensureDatabase = async () => {
  const adminClient = new Client({
    host:     DB_HOST,
    port:     DB_PORT,
    user:     DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',          // always exists — safe bootstrap DB
  });

  await adminClient.connect();

  const { rows } = await adminClient.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [DB_NAME]
  );

  if (rows.length === 0) {
    // pg doesn't support parameterised identifiers — name is safe from .env
    await adminClient.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`✅  Database "${DB_NAME}" created.`);
  } else {
    console.log(`✅  Database "${DB_NAME}" already exists.`);
  }

  await adminClient.end();
};

/**
 * Creates the bookmarks table inside the app database if it doesn't exist.
 */
const ensureTable = async () => {
  // Database table management is now handled by Prisma via `npx prisma db push` or `migrate dev`.
  console.log('✅  Table management is now handled by Prisma.');
};

const start = async () => {
  try {
    await ensureDatabase();   // step 1 — create DB if absent
    await ensureTable();      // step 2 — create table if absent
    const server = app.listen(PORT, () => {
      console.log(`🚀  Bookmark API listening on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌  Port ${PORT} is already in use.`);
        console.error('💡  Tip: You likely have another instance of this server running in a different terminal tab.');
        console.error('💡  Tip: Close all other terminals and try running "npm run dev" again.');
      } else {
        console.error('❌  Unexpected server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

