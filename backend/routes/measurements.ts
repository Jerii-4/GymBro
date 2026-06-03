import { Router, Response } from "express";
import pool from "../db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Secure all endpoints in this router
router.use(authenticateToken);

// GET /api/measurements - Fetch all body measurements for the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, height_cm AS \"heightCm\", weight_kg AS \"weightKg\", biceps_cm AS \"bicepsCm\", forearm_cm AS \"forearmCm\", chest_cm AS \"chestCm\", waist_cm AS \"waistCm\", thighs_cm AS \"thighsCm\", calves_cm AS \"calvesCm\", body_fat_pct AS \"bodyFatPct\" FROM measurements WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
    
    // Parse numeric fields to JavaScript Numbers
    const measurements = result.rows.map((row) => ({
      ...row,
      heightCm: row.heightCm ? Number(row.heightCm) : undefined,
      weightKg: row.weightKg ? Number(row.weightKg) : undefined,
      bicepsCm: row.bicepsCm ? Number(row.bicepsCm) : undefined,
      forearmCm: row.forearmCm ? Number(row.forearmCm) : undefined,
      chestCm: row.chestCm ? Number(row.chestCm) : undefined,
      waistCm: row.waistCm ? Number(row.waistCm) : undefined,
      thighsCm: row.thighsCm ? Number(row.thighsCm) : undefined,
      calvesCm: row.calvesCm ? Number(row.calvesCm) : undefined,
      bodyFatPct: row.bodyFatPct ? Number(row.bodyFatPct) : undefined,
    }));
    
    res.json(measurements);
  } catch (err) {
    console.error("Error fetching measurements:", err);
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});

// POST /api/measurements - Add or update a measurement for the current user (UPSERT)
router.post("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const {
    date,
    heightCm,
    weightKg,
    bicepsCm,
    forearmCm,
    chestCm,
    waistCm,
    thighsCm,
    calvesCm,
    bodyFatPct,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO measurements (
        user_id, date, height_cm, weight_kg, biceps_cm, forearm_cm, chest_cm, waist_cm, thighs_cm, calves_cm, body_fat_pct
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, date) DO UPDATE SET
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        biceps_cm = EXCLUDED.biceps_cm,
        forearm_cm = EXCLUDED.forearm_cm,
        chest_cm = EXCLUDED.chest_cm,
        waist_cm = EXCLUDED.waist_cm,
        thighs_cm = EXCLUDED.thighs_cm,
        calves_cm = EXCLUDED.calves_cm,
        body_fat_pct = EXCLUDED.body_fat_pct`,
      [
        userId,
        date,
        heightCm || null,
        weightKg || null,
        bicepsCm || null,
        forearmCm || null,
        chestCm || null,
        waistCm || null,
        thighsCm || null,
        calvesCm || null,
        bodyFatPct || null,
      ]
    );
    res.json({ message: "Measurement saved successfully!" });
  } catch (err) {
    console.error("Error saving measurement:", err);
    res.status(500).json({ error: "Failed to save measurement" });
  }
});

export default router;
