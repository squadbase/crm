import { defineConfig } from 'drizzle-kit';

// SSL設定を判定
const getSSLConfig = () => {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const sslMode = process.env.POSTGRES_SSL;
  
  // 明示的にSSLを無効にした場合
  if (sslMode === 'false') {
    return false;
  }
  
  // 明示的にSSLを有効にした場合
  if (sslMode === 'true' || sslMode === 'require') {
    return { rejectUnauthorized: false };
  }
  
  // ローカル環境ではSSLを無効、本番環境では有効
  if (host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  
  // 本番環境のデフォルト
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