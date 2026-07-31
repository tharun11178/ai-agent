import { initDatabase, dbRun, dbAll } from '../server/db/database';

async function main() {
  await initDatabase();
  await dbRun("UPDATE problems SET status = 'Hidden'");
  const rows = await dbAll("SELECT id, title, status FROM problems");
  console.log("Updated DB Problems:", rows);
}

main().catch(console.error);
