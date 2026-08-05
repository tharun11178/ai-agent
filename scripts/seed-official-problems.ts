import { initDatabase, dbRun, dbAll } from '../server/db/database';

async function main() {
  console.log('Initializing Database and seeding 11 Official Problem Statements...');
  await initDatabase();
  await dbRun("UPDATE problems SET status = 'Draft', scanCount = 0 WHERE status IS NULL OR status = ''");
  const rows = await dbAll("SELECT id, title, category, difficulty, status, accessToken, qrCode, scanCount FROM problems ORDER BY CAST(id AS INTEGER) ASC");
  console.log(`Successfully populated ${rows.length} Official Problem Statements:`);
  console.log(rows);
}

main().catch(console.error);
