import pool from "./db";
async function test() {
  const userId = 2; // Testing for jerin
  try {
    await pool.query("BEGIN");
    console.log("Archiving goal...");
    await pool.query(`
      INSERT INTO nutrition_goals_history 
        (user_id, protein_target, calorie_target, phase, current_weight, target_weight, months, started_at)
      SELECT 
        user_id, protein_target, calorie_target, phase, current_weight, target_weight, months, created_at
      FROM nutrition_goals
      WHERE user_id = $1
    `, [userId]);
    console.log("Goal archived successfully.");
    
    console.log("Deleting goal...");
    await pool.query("DELETE FROM nutrition_goals WHERE user_id = $1", [userId]);
    console.log("Goal deleted successfully.");
    
    await pool.query("ROLLBACK"); // Rollback so we don't actually delete it
    console.log("Test passed. Rollback completed.");
    process.exit(0);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Test failed:", err);
    process.exit(1);
  }
}
test();
