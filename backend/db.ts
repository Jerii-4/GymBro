import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Initialize the database connection pool using variables from process.env
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
});

// Verify the connection works on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
  } else {
    console.log("Database connection successful! Connected to:", process.env.DB_NAME);
    release(); // Return the client to the pool
  }
});

export default pool;
