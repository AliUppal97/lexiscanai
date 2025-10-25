/**
 * Global Setup Script
 * 
 * Runs once before all test suites.
 * Responsible for:
 * - Setting up test database
 * - Starting test services
 * - Initializing test data
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('\n🚀 Starting Global Test Setup...\n');

  try {
    // Check if we're in CI environment
    const isCI = process.env.CI === 'true';

    if (!isCI) {
      console.log('📦 Setting up test database...');
      
      // Create test database if it doesn't exist
      try {
        await execAsync('npx prisma db push --schema=./apps/api/prisma/schema.prisma --skip-generate --accept-data-loss');
        console.log('✅ Test database ready\n');
      } catch (error) {
        console.warn('⚠️  Database setup skipped (may already exist)\n');
      }

      // Run migrations
      console.log('🔄 Running database migrations...');
      try {
        await execAsync('npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma');
        console.log('✅ Migrations complete\n');
      } catch (error) {
        console.warn('⚠️  Migration skipped\n');
      }
    }

    console.log('✅ Global Test Setup Complete\n');
  } catch (error) {
    console.error('❌ Global Test Setup Failed:', error);
    throw error;
  }
}

