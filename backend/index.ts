import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "gymbro_fallback_secret_key";

app.use(cors());
app.use(express.json());

// Custom TypeScript interface to extend Express's Request with our user session details
interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  // The header format is usually: "Bearer <TOKEN_STRING>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid or expired" });
    }
    // Attach user info (userId, username) to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    next(); // Pass control to the next handler
  });
};

// ============================================================================
// USER REGISTER & LOGIN ENDPOINTS
// ============================================================================

// POST /api/auth/register - Register a new user
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // 1. Check if username is already taken
    const userCheck = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Save user to the database
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// POST /api/auth/login - Authenticate user and return JWT
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // 1. Find user in the database
    const result = await pool.query(
      "SELECT id, username, password_hash AS \"passwordHash\" FROM users WHERE username = $1",
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // 3. Create a JWT token (lasts for 7 days)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: user.username,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// ============================================================================
// PROTECTED API ENDPOINTS (FILTERED BY req.user.userId)
// ============================================================================

// GET /api/sessions - Fetches only the logged-in user's workout sessions
app.get("/api/sessions", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    // 1. Fetch sessions belonging to this user
    const sessionsResult = await pool.query(
      "SELECT id, day_label AS \"dayLabel\", performed_at AS \"performedAt\", body_weight_kg AS \"bodyWeightKg\" FROM sessions WHERE user_id = $1 ORDER BY performed_at DESC",
      [userId]
    );

    // 2. Fetch exercises belonging to this user's sessions
    const exercisesResult = await pool.query(
      "SELECT e.id, e.session_id AS \"sessionId\", e.name, e.rest_seconds AS \"restSeconds\" FROM exercises e JOIN sessions s ON e.session_id = s.id WHERE s.user_id = $1",
      [userId]
    );

    // 3. Fetch sets belonging to this user's exercises
    const setsResult = await pool.query(
      "SELECT es.exercise_id AS \"exerciseId\", es.reps, es.weight FROM exercise_sets es JOIN exercises e ON es.exercise_id = e.id JOIN sessions s ON e.session_id = s.id WHERE s.user_id = $1 ORDER BY es.id ASC",
      [userId]
    );

    const sessions = sessionsResult.rows;
    const exercises = exercisesResult.rows;
    const sets = setsResult.rows;

    // 4. Assemble nesting
    const sessionsWithData = sessions.map((session) => {
      const sessionExercises = exercises
        .filter((ex) => ex.sessionId === session.id)
        .map((ex) => {
          const exerciseSets = sets
            .filter((s) => s.exerciseId === ex.id)
            .map((s) => ({
              reps: s.reps,
              weight: s.weight ? Number(s.weight) : undefined,
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch workout sessions" });
  }
});

// POST /api/sessions - Save a new session belonging to this user (using Transaction)
app.post("/api/sessions", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id, dayLabel, performedAt, bodyWeightKg, exercises } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert session with user_id association
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
              "INSERT INTO exercise_sets (exercise_id, reps, weight) VALUES ($1, $2, $3)",
              [ex.id, set.reps, set.weight || null]
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Session saved successfully!" });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to save workout session" });
  } finally {
    client.release();
  }
});

// GET /api/measurements - Fetches user measurements
app.get("/api/measurements", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, height_cm AS \"heightCm\", weight_kg AS \"weightKg\", biceps_cm AS \"bicepsCm\", forearm_cm AS \"forearmCm\", chest_cm AS \"chestCm\", waist_cm AS \"waistCm\", thighs_cm AS \"thighsCm\", calves_cm AS \"calvesCm\", body_fat_pct AS \"bodyFatPct\" FROM measurements WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});

// POST /api/measurements - Adds/updates a measurement for this user (UPSERT)
app.post("/api/measurements", authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error(err);
    res.status(500).json({ error: "Failed to save measurement" });
  }
});

// GET /api/foods - Get logged foods for user
app.get("/api/foods", authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch food entries" });
  }
});

// POST /api/foods - Log a food for user
app.post("/api/foods", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id, name, grams, protein, calories, source } = req.body;
  try {
    await pool.query(
      "INSERT INTO food_entries (id, user_id, name, grams, protein, calories, source) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, userId, name, grams, protein, calories, source || "manual"]
    );
    res.status(201).json({ message: "Food entry added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add food entry" });
  }
});

// DELETE /api/foods/:id - Remove a food entry for user
app.delete("/api/foods/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM food_entries WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ message: "Food entry deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete food entry" });
  }
});

// GET /api/goals - Get user goals
app.get("/api/goals", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      "SELECT protein_target AS \"proteinTarget\", calorie_target AS \"calorieTarget\", phase FROM nutrition_goals WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/goals - Update user goals (UPSERT)
app.post("/api/goals", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { proteinTarget, calorieTarget, phase } = req.body;
  try {
    await pool.query(
      `INSERT INTO nutrition_goals (user_id, protein_target, calorie_target, phase) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        protein_target = EXCLUDED.protein_target,
        calorie_target = EXCLUDED.calorie_target,
        phase = EXCLUDED.phase`,
      [userId, proteinTarget, calorieTarget, phase]
    );
    res.json({ message: "Goals saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save nutrition goals" });
  }
});

// GET /api/tracks - Get user custom music tracks
app.get("/api/tracks", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query("SELECT id, name, url, duration FROM music_tracks WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// POST /api/tracks - Save user custom music tracks
app.post("/api/tracks", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { tracks } = req.body;
  if (!Array.isArray(tracks)) {
    return res.status(400).json({ error: "Invalid tracks payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const track of tracks) {
      await client.query(
        "INSERT INTO music_tracks (id, user_id, name, url, duration) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING",
        [track.id, userId, track.name, track.url, track.duration || null]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ message: "Tracks synchronized!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to sync tracks" });
  } finally {
    client.release();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`GymBro backend running on http://localhost:${PORT}`);
});
