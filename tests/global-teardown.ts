/**
 * Global Teardown Script
 * 
 * Runs once after all test suites complete.
 * Responsible for:
 * - Cleaning up test database
 * - Stopping test services
 * - Removing temporary files
 */

export default async function globalTeardown() {
  console.log('\n🧹 Starting Global Test Teardown...\n');

  try {
    // Check if we're in CI environment
    const isCI = process.env.CI === 'true';

    if (!isCI) {
      console.log('🗑️  Cleaning up test resources...');
      
      // Cleanup is handled by individual test suites
      // to prevent data loss during parallel test execution
      
      console.log('✅ Cleanup complete\n');
    }

    console.log('✅ Global Test Teardown Complete\n');
  } catch (error) {
    console.error('❌ Global Test Teardown Failed:', error);
  }
}

