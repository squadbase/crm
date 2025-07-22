import { defineConfig } from 'drizzle-kit';

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

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DATABASE || 'crm_db',
    ssl: getSSLConfig(),
  },
});