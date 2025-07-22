#!/usr/bin/env tsx

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function executeSql(sql: string) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });

  try {
    await client.connect();
    
    const result = await client.query(sql);
    
    // Format the response as JSON
    const response = {
      success: true,
      rowCount: result.rowCount,
      rows: result.rows,
      fields: result.fields?.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
        dataTypeSize: field.dataTypeSize,
        dataTypeModifier: field.dataTypeModifier,
        format: field.format,
        tableID: field.tableID,
        columnID: field.columnID,
      })) || [],
      command: result.command,
      executedAt: new Date().toISOString(),
    };

    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'UNKNOWN',
        detail: (error as any)?.detail || null,
        hint: (error as any)?.hint || null,
        position: (error as any)?.position || null,
        internalPosition: (error as any)?.internalPosition || null,
        internalQuery: (error as any)?.internalQuery || null,
        where: (error as any)?.where || null,
        schema: (error as any)?.schema || null,
        table: (error as any)?.table || null,
        column: (error as any)?.column || null,
        dataType: (error as any)?.dataType || null,
        constraint: (error as any)?.constraint || null,
        file: (error as any)?.file || null,
        line: (error as any)?.line || null,
        routine: (error as any)?.routine || null,
      },
      executedAt: new Date().toISOString(),
    };

    console.error(JSON.stringify(errorResponse, null, 2));
    process.exit(1);
    
  } finally {
    await client.end();
  }
}

// Get SQL from command line arguments
const sql = process.argv[2];

if (!sql) {
  console.error(JSON.stringify({
    success: false,
    error: {
      message: 'SQL query is required as first argument',
      code: 'MISSING_SQL',
      usage: 'npm run sql "SELECT * FROM customers"',
    },
    executedAt: new Date().toISOString(),
  }, null, 2));
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(JSON.stringify({
    success: false,
    error: {
      message: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
      code: 'MISSING_ENV_VARS',
      missingVars: missingEnvVars,
    },
    executedAt: new Date().toISOString(),
  }, null, 2));
  process.exit(1);
}

// Execute the SQL
executeSql(sql);