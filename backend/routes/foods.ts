import { Router, Response } from "express";
import pool from "../db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Apply token validation to all routes in this router
router.use(authenticateToken);

// GET /api/foods - Fetch all food logs for the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT id, name, grams, protein, calories, source, TO_CHAR(logged_at, 'YYYY-MM-DD') AS \"loggedAt\" FROM food_entries WHERE user_id = $1 ORDER BY logged_at DESC, id DESC",
      [userId]
    );

    const foods = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      grams: Number(row.grams),
      protein: Number(row.protein),
      calories: Number(row.calories),
      source: row.source,
      loggedAt: row.loggedAt,
    }));

    res.json(foods);
  } catch (err) {
    console.error("Error fetching foods:", err);
    res.status(500).json({ error: "Failed to fetch food entries" });
  }
});

// POST /api/foods - Log a new food item for the current user
router.post("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id, name, grams, protein, calories, source } = req.body;
  try {
    await pool.query(
      "INSERT INTO food_entries (id, user_id, name, grams, protein, calories, source, logged_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id, userId, name, grams, protein, calories, source || "manual", req.body.loggedAt || new Date().toISOString()]
    );
    res.status(201).json({ message: "Food entry added!" });
  } catch (err) {
    console.error("Error adding food entry:", err);
    res.status(500).json({ error: "Failed to add food entry" });
  }
});

// DELETE /api/foods/goals - Delete the user's current nutrition goals (archives to history first)
router.delete("/goals", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    await pool.query(`
      INSERT INTO nutrition_goals_history (user_id, protein_target, calorie_target, phase, current_weight, target_weight, months, started_at)
      SELECT user_id, protein_target, calorie_target, phase, current_weight, target_weight, months, created_at 
      FROM nutrition_goals WHERE user_id = $1
    `, [userId]);
    await pool.query("DELETE FROM nutrition_goals WHERE user_id = $1", [userId]);
    res.json({ message: "Goals deleted successfully!" });
  } catch (err) {
    console.error("Error deleting nutrition goals:", err);
    res.status(500).json({ error: "Failed to delete nutrition goals" });
  }
});

// DELETE /api/foods/goals/history/:id - Delete a historical goal
router.delete("/goals/history/:id", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM nutrition_goals_history WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ message: "History deleted successfully!" });
  } catch (err) {
    console.error("Error deleting historical goal:", err);
    res.status(500).json({ error: "Failed to delete historical goal" });
  }
});

// DELETE /api/foods/:id - Remove a food entry logged by the current user
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM food_entries WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ message: "Food entry deleted!" });
  } catch (err) {
    console.error("Error deleting food entry:", err);
    res.status(500).json({ error: "Failed to delete food entry" });
  }
});

// GET /api/foods/goals - Fetch user's nutrition targets
router.get("/goals", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT protein_target AS \"proteinTarget\", calorie_target AS \"calorieTarget\", phase, current_weight AS \"currentWeight\", target_weight AS \"targetWeight\", months, created_at AS \"createdAt\" FROM nutrition_goals WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/foods/goals - Save or update nutrition targets (UPSERT)
router.post("/goals", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { proteinTarget, calorieTarget, phase, currentWeight, targetWeight, months } = req.body;
  try {
    await pool.query(
      `INSERT INTO nutrition_goals (user_id, protein_target, calorie_target, phase, current_weight, target_weight, months) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        protein_target = EXCLUDED.protein_target,
        calorie_target = EXCLUDED.calorie_target,
        phase = EXCLUDED.phase,
        current_weight = EXCLUDED.current_weight,
        target_weight = EXCLUDED.target_weight,
        months = EXCLUDED.months`,
      [userId, proteinTarget, calorieTarget, phase, currentWeight, targetWeight, months]
    );
    res.json({ message: "Goals saved successfully!" });
  } catch (err) {
    console.error("Error saving nutrition goals:", err);
    res.status(500).json({ error: "Failed to save nutrition goals" });
  }
});

// GET /api/foods/goals/history - Fetch historical nutrition goals
router.get("/goals/history", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT id, protein_target AS \"proteinTarget\", calorie_target AS \"calorieTarget\", phase, current_weight AS \"currentWeight\", target_weight AS \"targetWeight\", months, started_at AS \"startedAt\", ended_at AS \"endedAt\" FROM nutrition_goals_history WHERE user_id = $1 ORDER BY ended_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching goal history:", err);
    res.status(500).json({ error: "Failed to fetch goal history" });
  }
});

export default router;
