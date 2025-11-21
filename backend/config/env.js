import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Attempt to load environment variables from the backend folder first.
 * If the file does not exist (common in freshly cloned repos), fall back to
 * the workspace root .env so the backend can still boot with shared settings.
 */
const candidateEnvFiles = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

let loadedEnvFile;

for (const filePath of candidateEnvFiles) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    loadedEnvFile = filePath;
    break;
  }
}

// Final fallback – let dotenv try the default location so NODE_ENV, etc. set via shell still work.
if (!loadedEnvFile) {
  dotenv.config();
}

const warnIfFallbackUsed = (key, fallback) => {
  if (process.env[key] && process.env[key].trim() !== '') {
    return process.env[key];
  }

  if (fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  console.warn(
    `[env] ${key} is not set. Using safe development fallback value. ` +
      `Create backend/.env to override this in your environment.`
  );

  process.env[key] = fallback;
  return fallback;
};

const resolveMongoUri = () => {
  const value = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (value && value.trim() !== '') {
    return value;
  }

  const fallback = 'mongodb://127.0.0.1:27017/edulegal';
  console.warn(
    `[env] MONGO_URI (or MONGODB_URI) not found. Falling back to local MongoDB instance at ${fallback}.`
  );
  console.warn('[env] Update backend/.env if you intend to use MongoDB Atlas.');
  process.env.MONGO_URI = fallback;
  return fallback;
};

export const ENV = {
  NODE_ENV: warnIfFallbackUsed('NODE_ENV', 'development'),
  PORT: Number.parseInt(warnIfFallbackUsed('PORT', '5000'), 10),
  FRONTEND_URL: warnIfFallbackUsed('FRONTEND_URL', 'http://localhost:5173'),
  JWT_SECRET: warnIfFallbackUsed('JWT_SECRET', 'dev-only-jwt-secret-change-me'),
  DB_NAME: warnIfFallbackUsed('DB_NAME', 'edulegal'),
  MONGO_URI: resolveMongoUri(),
};

export const loadedEnvPath = loadedEnvFile;

