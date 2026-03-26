# monero-nodejs Code Review

## Critical Issues (P0) - Fix Immediately

- [x] **1. Duplicate URL Bug in `wallet-axios.js:66`**
  - The `url` variable is constructed but unused; hardcoded URL ignores `this.url` and `this.rpcPath`
  - **Fix:** Use the constructed `url` variable in the axios call

- [x] **2. Silent Error Swallowing in `wallet-axios.js:74-76`**
  - Errors are caught and logged but not re-thrown
  - **Fix:** Remove catch block or re-throw the error

- [x] **3. Deprecated axios `auth` Configuration (both files)**
  - Using deprecated `user`/`pass`/`sendImmediately` instead of `username`/`password`
  - **Fix:** Update to modern axios auth format

## High Priority Issues (P1)

- [x] **4. Constructor Side-Effects**
  - `get_balance` RPC call during construction makes testing difficult
  - **Fix:** Extract to explicit `connect()` or `initialize()` method

- [x] **5. Consolidate Dual Implementations**
  - Two wallet files with divergent behavior (`wallet.js` vs `wallet-axios.js`)
  - **Fix:** Delete `wallet.js`, make `wallet-axios.js` the main entry

## Medium Priority Issues (P2)

- [x] **6. Inconsistent Semicolon Usage**
  - `wallet-axios.js` mixes semicolon-terminated and non-terminated method definitions
  - **Fix:** Standardize code style

- [x] **7. Unused `http` Import in `wallet.js`**
  - Import is unused, leftover from refactoring
  - **Fix:** Remove import

- [x] **8. Unused `forever` Option in `wallet.js`**
  - Request-specific option not used by axios
  - **Fix:** Remove option

- [x] **9. Test Suite Mismatched Framework**
  - Tests use `node:test`/`node:assert` but mocha.opts configures different setup
  - **Fix:** Align test framework configuration - rewrote tests for native Node.js test runner

## Low Priority Issues (P3)

- [x] **10. Floating-Point Precision Risk in `convert()`**
  - Large amounts may lose precision before atomic unit conversion
  - **Fix:** Use BigInt-based conversion to handle arbitrary precision correctly

- [x] **11. README Outdated**
  - Shows `require()` syntax but package is ES modules
  - References old `simplewallet` name
  - **Fix:** Updated documentation for ES modules and modern monero-wallet-rpc terminology
