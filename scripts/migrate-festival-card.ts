import { config } from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  config({ path: '.env.development' });
} else if (env === 'production') {
  config({ path: '.env.production' });
} else {
  config();
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

async function main() {
  const client = postgres(databaseUrl, {
    ssl: false,
    max: 1,
  });

  try {
    const sqlPath = path.resolve(process.cwd(), 'scripts/sql/create-festival-card-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.unsafe(sql);
    console.log('festival card tables migrated successfully');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

