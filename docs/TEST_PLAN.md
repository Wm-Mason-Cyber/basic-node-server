# Test Plan for Basic Node.js Server

This document outlines the testing strategy for the `basic-node-server` project, focusing on verifying the functionality of web vulnerability demonstrations (XSS and SQLi) and ensuring the server behaves as expected under various inputs.

## Objectives:

*   Verify that intentionally vulnerable endpoints exhibit the expected security flaws (e.g., direct reflection of XSS payloads, successful SQL injection).
*   Verify that safe endpoints correctly sanitize or escape user input to prevent XSS and SQL injection.
*   Ensure all API endpoints return expected data formats.
*   Confirm the server handles basic requests and renders views correctly.
*   Ensure the data reset mechanism functions as intended.

## Testing Tools:

*   **Jest:** JavaScript testing framework for running unit and integration tests.
*   **Supertest:** A library for testing HTTP servers, making it easy to send requests and assert responses.

## Test Strategy:

Tests are designed to be automated, fast, and deterministic. Each test run should leave the system in a clean state.

### 1. Unit/Integration Tests (Automated)

All tests are located in the `tests/` directory and are executed via `npm test`.

**a. `tests/test_xss.test.js`**
*   **Purpose:** To verify the behavior of reflected and stored XSS endpoints.
*   **Scenarios:**
    *   **Reflected XSS (Vulnerable):**
        *   Send a GET request to `/vuln_reflected` with a `<script>alert('XSS')</script>` payload in the `q` parameter.
        *   Assert that the response status is 200 OK.
        *   Assert that the response body HTML *contains* the unescaped payload.
    *   **Reflected XSS (Safe):**
        *   Send a GET request to `/safe_reflected` with the same XSS payload.
        *   Assert that the response status is 200 OK.
        *   Assert that the response body HTML *does not contain* the unescaped payload.
        *   Assert that the response body HTML *contains* the HTML-escaped version of the payload (e.g., `&lt;script&gt;`).
    *   **Stored XSS (Vulnerable):**
        *   POST a `<img src=x onerror=alert('XSS')>` payload to `/stored_vuln`.
        *   Assert a successful redirect (302).
        *   GET `/stored_vuln` and assert that the response body HTML *contains* the unescaped payload.
        *   Use the `/reset-data` endpoint for cleanup.
    *   **Stored XSS (Safe):**
        *   POST the same XSS payload to `/stored_safe`.
        *   Assert a successful redirect (302).
        *   GET `/stored_safe` and assert that the response body HTML *does not contain* the unescaped payload.
        *   Assert that the response body HTML *contains* the HTML-escaped version of the payload.
        *   Use the `/reset-data` endpoint for cleanup.
    *   **API Endpoint:**
        *   Send a GET request to `/api/search` with a query parameter.
        *   Assert that the response is JSON.
        *   Assert that the JSON response contains the `ok`, `query`, and `safe` fields with expected values.

**b. `tests/test_sql.test.js`**
*   **Purpose:** To verify the behavior of SQL injection endpoints.
*   **Setup:**
    *   `beforeAll`: Initializes the SQLite database (using `initDb()`) and ensures a clean state with `reset-data`.
    *   `beforeEach`: Resets the `users` table to a known state (deletes all users and re-inserts `admin`, `user1`, `user2`). This ensures test isolation.
    *   `afterAll`: Closes the database connection (`closeDb()`) and performs final cleanup with `reset-data`.
*   **Scenarios:**
    *   **SQL Injection (Vulnerable):**
        *   Send a GET request to `/sql_vuln` with an injection payload like `admin' OR '1'='1' --` in the `name` parameter.
        *   Assert that the response status is 200 OK.
        *   Assert that the response body HTML *contains* all expected user names (e.g., "admin", "user1", "user2"), demonstrating authentication bypass/information disclosure.
        *   Send a GET request with a valid user (`user1`) and assert it's found.
    *   **SQL Injection (Safe):**
        *   Send a GET request to `/sql_safe` with the same injection payload.
        *   Assert that the response status is 200 OK.
        *   Assert that the response body HTML *does not contain* any actual user names from the database, and instead shows that the literal injected string was not found.
        *   Send a GET request with a valid user (`user2`) and assert it's found.
        *   Send a GET request with a non-existent user (`nonexistent`) and assert it's not found.

### 2. Manual Testing (Exploratory/Worksheet-Driven)

Students will perform manual tests by interacting with the web application through their browser, following the steps outlined in `docs/WORKSHEET.md`. This includes:

*   Navigating to various endpoints.
*   Inputting payloads directly into URL parameters and form fields.
*   Observing browser behavior (alerts, rendered HTML).
*   Inspecting server console logs for SQL queries and application messages.
*   Using browser developer tools to examine HTML source and network requests.

### 3. Data Reset Verification

*   Manually run `npm run reset-data`.
*   Verify that `data/messages.json` is cleared/removed and `data/node_demo.db` is removed.
*   Start the server and confirm the database is re-initialized with default users.

## Test Environment:

*   Local machine (Node.js environment).
*   Docker container (for consistency and mimicking deployment).
*   GitHub Actions CI pipeline (automates `npm test` on code changes).

## Test Data:

*   `data/messages.json`: Stores messages for XSS demos. Expected to be empty or re-initialized by tests/scripts.
*   `data/node_demo.db`: SQLite database for SQLi demos. Expected to contain a `users` table with 'admin', 'user1', 'user2' after initialization.

## Exit Criteria:

*   All automated Jest/Supertest tests pass.
*   Manual walkthroughs of `docs/WORKSHEET.md` confirm expected vulnerable and safe behaviors.
*   The `reset_data.sh` script functions correctly.