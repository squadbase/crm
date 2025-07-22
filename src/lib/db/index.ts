import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Determine SSL configuration
const getSSLConfig = () => {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const sslMode = process.env.POSTGRES_SSL;
  
  // When SSL is explicitly disabled
  if (sslMode === 'false') {
    return false;
  }
  
  // When SSL is explicitly enabled
  if (sslMode === 'true' || sslMode === 'require') {
    return { rejectUnauthorized: false };
  }
  
  // Disable SSL for local environment, enable for production
  if (host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  
  // Production environment default
  return { rejectUnauthorized: false };
};

const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DATABASE || 'crm_db',
  ssl: getSSLConfig(),
};

// Debug: Log connection settings (password excluded)
if (process.env.NODE_ENV !== 'production') {
  console.log('Database config:', {
    ...config,
    password: '[REDACTED]',
  });
}

const pool = new Pool(config);

export const db = drizzle(pool, { schema });