import pool from "./db";

async function run() {
  try {
    console.log("Running migration to add rest_seconds to exercise_sets...");
    await pool.query(`
      ALTER TABLE exercise_sets 
      ADD COLUMN IF NOT EXISTS rest_seconds INTEGER;
    `);
    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
