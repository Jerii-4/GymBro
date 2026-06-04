import { Router, Response } from "express";
import pool from "../db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Apply token validation to all routes inside this sessions router
router.use(authenticateToken);

// GET /api/sessions - Get workout sessions logged by the current user
router.get("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    // 1. Fetch user's sessions
    const sessionsResult = await pool.query(
      "SELECT id, day_label AS \"dayLabel\", performed_at AS \"performedAt\", body_weight_kg AS \"bodyWeightKg\" FROM sessions WHERE user_id = $1 ORDER BY performed_at DESC",
      [userId]
    );

    // 2. Fetch exercises inside those sessions
    const exercisesResult = await pool.query(
      "SELECT e.id, e.session_id AS \"sessionId\", e.name, e.rest_seconds AS \"restSeconds\" FROM exercises e JOIN sessions s ON e.session_id = s.id WHERE s.user_id = $1",
      [userId]
    );

    // 3. Fetch sets inside those exercises
    const setsResult = await pool.query(
      "SELECT es.exercise_id AS \"exerciseId\", es.reps, es.weight, es.rest_seconds AS \"restSeconds\" FROM exercise_sets es JOIN exercises e ON es.exercise_id = e.id JOIN sessions s ON e.session_id = s.id WHERE s.user_id = $1 ORDER BY es.id ASC",
      [userId]
    );

    const sessions = sessionsResult.rows;
    const exercises = exercisesResult.rows;
    const sets = setsResult.rows;

    // 4. Group data into nested JSON
    const sessionsWithData = sessions.map((session) => {
      const sessionExercises = exercises
        .filter((ex) => ex.sessionId === session.id)
        .map((ex) => {
          const exerciseSets = sets
            .filter((s) => s.exerciseId === ex.id)
            .map((s) => ({
              reps: s.reps,
              weight: s.weight ? Number(s.weight) : undefined,
              restSeconds: s.restSeconds ? Number(s.restSeconds) : undefined,
            }));
          return {
            id: ex.id,
            name: ex.name,
            restSeconds: ex.restSeconds || undefined,
            sets: exerciseSets,
          };
        });

      return {
        id: session.id,
        dayLabel: session.dayLabel,
        performedAt: session.performedAt,
        bodyWeightKg: session.bodyWeightKg ? Number(session.bodyWeightKg) : undefined,
        exercises: sessionExercises,
      };
    });

    res.json(sessionsWithData);
  } catch (err: any) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch workout sessions" });
  }
});

// POST /api/sessions - Save a new session for the current user (Transaction)
router.post("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id, dayLabel, performedAt, bodyWeightKg, exercises } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete any existing session on the same date for this user to allow overrides (workout <=> rest day)
    const sessionDate = new Date(performedAt).toISOString().slice(0, 10);
    await client.query(
      "DELETE FROM sessions WHERE user_id = $1 AND TO_CHAR(performed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') = $2",
      [userId, sessionDate]
    );

    // Insert session linked to user_id
    await client.query(
      "INSERT INTO sessions (id, user_id, day_label, performed_at, body_weight_kg) VALUES ($1, $2, $3, $4, $5)",
      [id, userId, dayLabel, performedAt, bodyWeightKg]
    );

    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        await client.query(
          "INSERT INTO exercises (id, session_id, name, rest_seconds) VALUES ($1, $2, $3, $4)",
          [ex.id, id, ex.name, ex.restSeconds || null]
        );

        if (ex.sets && Array.isArray(ex.sets)) {
          for (const set of ex.sets) {
            await client.query(
              "INSERT INTO exercise_sets (exercise_id, reps, weight, rest_seconds) VALUES ($1, $2, $3, $4)",
              [ex.id, set.reps, set.weight || null, set.restSeconds || null]
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Session saved successfully!" });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Error saving session:", err);
    res.status(500).json({ error: "Failed to save workout session" });
  } finally {
    client.release();
  }
});

export default router;
