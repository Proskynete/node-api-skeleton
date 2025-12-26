#!/usr/bin/env node

/**
 * Run Performance Tests Script
 *
 * Automatically discovers and executes k6 performance test files
 * in the test/performance/ directory.
 *
 * Usage:
 *   node scripts/run-performance-tests.js              # Run all tests
 *   node scripts/run-performance-tests.js greetings-v1 # Run specific test
 *   npm run test:performance                           # Run all tests
 *   npm run test:performance greetings-v1              # Run specific test
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PERFORMANCE_DIR = path.join(__dirname, "../test/performance");
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

/**
 * Print colored message to console
 */
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

/**
 * Print section header
 */
function header(message) {
  console.log();
  log("=".repeat(80), COLORS.cyan);
  log(message, COLORS.bright + COLORS.cyan);
  log("=".repeat(80), COLORS.cyan);
  console.log();
}

/**
 * Find all k6 test files in performance directory
 */
function findK6Tests(filePattern = null) {
  if (!fs.existsSync(PERFORMANCE_DIR)) {
    throw new Error(`Performance tests directory not found: ${PERFORMANCE_DIR}`);
  }

  let files = fs
    .readdirSync(PERFORMANCE_DIR)
    .filter((file) => file.endsWith(".k6.js"))
    .map((file) => path.join(PERFORMANCE_DIR, file))
    .sort();

  // Filter by pattern if provided
  if (filePattern) {
    const pattern = filePattern.endsWith(".k6.js")
      ? filePattern
      : `${filePattern}.k6.js`;

    files = files.filter((file) => {
      const fileName = path.basename(file);
      return fileName === pattern || fileName.includes(filePattern);
    });

    if (files.length === 0) {
      throw new Error(
        `No test file found matching pattern: "${filePattern}"\n` +
        `Available tests: ${fs.readdirSync(PERFORMANCE_DIR)
          .filter((f) => f.endsWith(".k6.js"))
          .join(", ")}`
      );
    }
  }

  return files;
}

/**
 * Run a single k6 test file
 */
function runK6Test(testFile) {
  const fileName = path.basename(testFile);
  const startTime = Date.now();

  try {
    log(`\n▶ Running: ${fileName}`, COLORS.blue);
    log(`  Path: ${testFile}`, COLORS.blue);
    console.log();

    // Execute k6 test
    execSync(`k6 run "${testFile}"`, {
      stdio: "inherit",
      encoding: "utf-8",
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n✓ PASSED: ${fileName} (${duration}s)`, COLORS.green);

    return { file: fileName, status: "passed", duration };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n✗ FAILED: ${fileName} (${duration}s)`, COLORS.red);

    return { file: fileName, status: "failed", duration, error };
  }
}

/**
 * Print test results summary
 */
function printSummary(results) {
  header("PERFORMANCE TEST RESULTS SUMMARY");

  const passed = results.filter((r) => r.status === "passed");
  const failed = results.filter((r) => r.status === "failed");
  const totalDuration = results
    .reduce((sum, r) => sum + parseFloat(r.duration), 0)
    .toFixed(2);

  console.log("Test Files:");
  results.forEach((result) => {
    const statusIcon = result.status === "passed" ? "✓" : "✗";
    const statusColor = result.status === "passed" ? COLORS.green : COLORS.red;
    log(
      `  ${statusIcon} ${result.file} (${result.duration}s)`,
      statusColor
    );
  });

  console.log();
  log(`Total Tests: ${results.length}`, COLORS.bright);
  log(`Passed: ${passed.length}`, COLORS.green);
  log(`Failed: ${failed.length}`, failed.length > 0 ? COLORS.red : COLORS.reset);
  log(`Duration: ${totalDuration}s`, COLORS.bright);

  if (failed.length > 0) {
    console.log();
    log("Failed Tests:", COLORS.red);
    failed.forEach((result) => {
      log(`  - ${result.file}`, COLORS.red);
    });
  }

  console.log();
  log("=".repeat(80), COLORS.cyan);
  console.log();
}

/**
 * Main execution function
 */
function main() {
  try {
    // Get file pattern from command line arguments
    const filePattern = process.argv[2];

    header("PERFORMANCE TESTS - K6");

    if (filePattern) {
      log(`Filter: Running tests matching "${filePattern}"`, COLORS.yellow);
      console.log();
    }

    // Find k6 test files (all or filtered by pattern)
    const testFiles = findK6Tests(filePattern);

    if (testFiles.length === 0) {
      log("⚠ No k6 test files found in test/performance/", COLORS.yellow);
      process.exit(0);
    }

    log(`Found ${testFiles.length} test file(s):`);
    testFiles.forEach((file) => {
      log(`  - ${path.basename(file)}`, COLORS.blue);
    });

    // Run all tests
    const results = [];
    for (const testFile of testFiles) {
      const result = runK6Test(testFile);
      results.push(result);
    }

    // Print summary
    printSummary(results);

    // Exit with error code if any tests failed
    const failedCount = results.filter((r) => r.status === "failed").length;
    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`\n✗ ERROR: ${error.message}`, COLORS.red);
    console.error(error);
    process.exit(1);
  }
}

// Run main function
main();
