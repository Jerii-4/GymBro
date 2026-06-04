-- ==========================================
-- GymBro Database Schema (Multi-User)
-- ==========================================

-- 1. Users Table
-- Stores user accounts with unique usernames and encrypted password hashes.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workout Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_label VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    body_weight_kg NUMERIC(5, 2)
);

-- 3. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rest_seconds INTEGER
);

-- 4. Exercise Sets Table
CREATE TABLE IF NOT EXISTS exercise_sets (
    id SERIAL PRIMARY KEY,
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    reps INTEGER NOT NULL,
    weight NUMERIC(5, 2),
    rest_seconds INTEGER
);

-- 5. Body Measurements Table
-- Primary key is a composite of (user_id, date) so each user has at most one log per day.
CREATE TABLE IF NOT EXISTS measurements (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    biceps_cm NUMERIC(4, 1),
    forearm_cm NUMERIC(4, 1),
    chest_cm NUMERIC(5, 1),
    waist_cm NUMERIC(5, 1),
    thighs_cm NUMERIC(4, 1),
    calves_cm NUMERIC(4, 1),
    body_fat_pct NUMERIC(4, 1),
    PRIMARY KEY (user_id, date)
);

-- 6. Food Entries Table
CREATE TABLE IF NOT EXISTS food_entries (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grams NUMERIC(6, 2) NOT NULL,
    protein NUMERIC(5, 2) NOT NULL,
    calories NUMERIC(6, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    logged_at DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 7. Nutrition Goals Table
-- Primary key is the user_id itself (one goal set per user).
CREATE TABLE IF NOT EXISTS nutrition_goals (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    protein_target INTEGER NOT NULL,
    calorie_target INTEGER NOT NULL,
    phase VARCHAR(50) NOT NULL
);

