# Scripts

This directory contains utility scripts for the project.

## Available Scripts

### `run-performance-tests.js`

Automatically discovers and executes all k6 performance test files in the `test/performance/` directory.

**Features:**
- 🔍 Auto-discovers all `*.k6.js` files
- 📊 Runs tests sequentially with detailed output
- ✨ Colored console output for better readability
- 📈 Summary report with pass/fail status and duration
- ❌ Exits with error code if any test fails

**Usage:**

```bash
# Using npm script (recommended)
npm run test:performance

# Direct execution
node scripts/run-performance-tests.js

# Make executable and run directly
chmod +x scripts/run-performance-tests.js
./scripts/run-performance-tests.js
```

**Output Example:**

```
================================================================================
PERFORMANCE TESTS - K6
================================================================================

Found 3 test file(s):
  - greetings-v1.k6.js
  - greetings-v2.k6.js
  - load-test.k6.js

▶ Running: greetings-v1.k6.js
  Path: /path/to/test/performance/greetings-v1.k6.js

[k6 output...]

✓ PASSED: greetings-v1.k6.js (45.23s)

[... more tests ...]

================================================================================
PERFORMANCE TEST RESULTS SUMMARY
================================================================================

Test Files:
  ✓ greetings-v1.k6.js (45.23s)
  ✓ greetings-v2.k6.js (47.89s)
  ✓ load-test.k6.js (125.45s)

Total Tests: 3
Passed: 3
Failed: 0
Duration: 218.57s

================================================================================
```

**Adding New Tests:**

Simply add a new `*.k6.js` file to the `test/performance/` directory. The script will automatically discover and run it.

Example:
```bash
touch test/performance/new-endpoint.k6.js
# Edit the file with your k6 test
npm run test:performance  # Will automatically include new test
```

**Requirements:**

- Node.js (built-in modules only, no external dependencies)
- k6 installed globally (`brew install k6` or see [k6 docs](https://k6.io/docs/getting-started/installation/))

**Exit Codes:**

- `0`: All tests passed
- `1`: One or more tests failed or script error

**Notes:**

- Tests run sequentially to avoid port conflicts and resource contention
- Each test runs independently with its own k6 instance
- The script preserves all k6 output for detailed analysis
- Failed tests don't stop execution; all tests run and results are summarized

---

**Related:**
- [Performance Testing Guide](../test/performance/README.md)
- [k6 Documentation](https://k6.io/docs/)
