import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import sessionsRouter from "./routes/sessions";
import measurementsRouter from "./routes/measurements";
import foodsRouter from "./routes/foods";

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for frontend access
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mount modular API routers
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/measurements", measurementsRouter);
app.use("/api/foods", foodsRouter);


// Start the Express server
app.listen(PORT, () => {
  console.log(`GymBro backend running on http://localhost:${PORT}`);
});
