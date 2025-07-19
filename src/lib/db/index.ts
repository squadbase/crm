import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

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

const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DATABASE || 'crm_db',
  ssl: getSSLConfig(),
};

// デバッグ用：接続設定をログ出力（パスワードは除く）
if (process.env.NODE_ENV !== 'production') {
  console.log('Database config:', {
    ...config,
    password: '[REDACTED]',
  });
}

const pool = new Pool(config);

export const db = drizzle(pool, { schema });