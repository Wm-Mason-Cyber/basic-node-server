# Cybersecurity Basics: XSS and SQLi Worksheet

## Student Tasks

This worksheet will guide you through exploring Cross-Site Scripting (XSS) and SQL Injection (SQLi) vulnerabilities using a specially designed web server. Follow the steps carefully and answer the questions.

**Important:** This server contains intentionally vulnerable code. Do NOT deploy it publicly or use these techniques on real websites without explicit permission.

---

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd basic-node-server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
    The server should now be running on `http://localhost:3000`. Open this URL in your web browser.

---

### Part 1: Reflected XSS

Reflected XSS occurs when user-supplied data is immediately returned by the web server in an un-sanitized form, leading to the execution of malicious scripts in the user's browser.

1.  **Explore the Vulnerable Endpoint:**
    *   Navigate to `http://localhost:3000/vuln_reflected?q=Hello`.
    *   Observe how your input "Hello" is displayed on the page.
    *   **Question 1.1:** What is the exact HTML output that displays your input "Hello"? (Use browser's developer tools to inspect the element).

2.  **Perform a Reflected XSS Attack:**
    *   Modify the `q` parameter in the URL with a simple JavaScript payload.
    *   Example payload: `http://localhost:3000/vuln_reflected?q=<script>alert('XSS!')</script>`
    *   **Question 1.2:** What happened when you accessed the URL with the `alert` script? Why?
    *   **Question 1.3:** Try another payload: `http://localhost:3000/vuln_reflected?q=<img src=x onerror=alert('Image+XSS')>` What happened this time?

3.  **Explore the Safe Endpoint:**
    *   Now, try the same `alert` script payload on the safe endpoint: `http://localhost:3000/safe_reflected?q=<script>alert('XSS!')</script>`
    *   **Question 1.4:** What happened this time? Did the script execute? Why not?
    *   **Question 1.5:** Inspect the HTML source for the safe page. How is the `<script>` tag rendered differently compared to the vulnerable page?

---

### Part 2: Stored XSS

Stored XSS (or Persistent XSS) occurs when malicious code injected by an attacker is stored on the target server (e.g., in a database, message forum, visitor log) and then permanently displayed to other users without proper sanitization.

1.  **Explore the Vulnerable Endpoint:**
    *   Navigate to `http://localhost:3000/stored_vuln`.
    *   **Question 2.1:** Post a regular message, e.g., "This is a test message." Observe.
    *   **Question 2.2:** Now, post the XSS `alert` script payload from Part 1: `<script>alert('Stored XSS!')</script>`. What happened immediately after posting? What happens if you refresh the page or if another user (you, in another browser tab) views the page?

2.  **Perform a Stored XSS Attack:**
    *   Post the image XSS payload: `<img src=x onerror=alert('Stored+Image+XSS')>` to the vulnerable endpoint.
    *   **Question 2.3:** What happens when this message is displayed?

3.  **Explore the Safe Endpoint:**
    *   Navigate to `http://localhost:3000/stored_safe`.
    *   Post the same `alert` script payload: `<script>alert('Stored XSS!')</script>`.
    *   **Question 2.4:** What happened? Did the script execute?
    *   **Question 2.5:** Inspect the HTML source. How is the `<script>` tag displayed compared to the vulnerable stored XSS page? How does the server prevent the execution of the malicious script?

---

### Part 3: SQL Injection (SQLi)

SQL Injection is a code injection technique used to attack data-driven applications, in which malicious SQL statements are inserted into an entry field for execution (e.g., to dump database contents to the attacker).

1.  **Explore the Vulnerable Endpoint:**
    *   Navigate to `http://localhost:3000/sql_vuln`.
    *   Try searching for a valid user: `admin`. Observe the result.
    *   **Question 3.1:** What is the SQL query that the server generated for "admin"? (Check the server console output where logs are displayed).

2.  **Perform a Basic SQLi Attack (Authentication Bypass):**
    *   Try searching for `admin' OR '1'='1' --` (The `--` comments out the rest of the original query).
    *   **Question 3.2:** What happened? How many users did you find? Why did this injection work? Explain the modified SQL query that was likely executed (refer to server logs).

3.  **Perform Another SQLi Attack (Error-Based or Information Disclosure):**
    *   (Advanced, often requires different types of payloads)
    *   Try searching for `' OR 1=1 UNION SELECT 1, sql, 3 FROM sqlite_master --` (This payload might require adjusting the number of columns if an error occurs).
    *   **Question 3.3:** What information did this payload reveal? (Note: This specific payload might not fully work without further refinement for column count, but observe any errors or unexpected output.)

4.  **Explore the Safe Endpoint:**
    *   Navigate to `http://localhost:3000/sql_safe`.
    *   Try searching for `admin`.
    *   **Question 3.4:** What is the SQL query used by the safe endpoint? (Check server console output). How does it differ from the vulnerable one?
    *   **Question 3.5:** Try the `admin' OR '1'='1' --` injection payload on the safe endpoint. What happened? Why did it not work this time?

---

### Part 4: API Endpoint

Web APIs can also be vulnerable. This example shows a simple API.

1.  **Explore the API:**
    *   Navigate to `http://localhost:3000/api/search?q=test_query`.
    *   **Question 4.1:** What is the output? What is the purpose of `safe` field?

2.  **Test API with XSS Payload:**
    *   Try `http://localhost:3000/api/search?q=<script>alert(1)</script>`.
    *   **Question 4.2:** What is the output? Is the XSS payload reflected in `query`? Is it escaped in `safe`? Why might it be important for an API to handle potentially malicious input, even if it's not rendering HTML directly?

---

## Teacher Answer Key (DO NOT DISTRIBUTE TO STUDENTS)

### Part 1: Reflected XSS Answers

**Question 1.1:**
`<div class="output"> You searched for: Hello </div>`
(The exact HTML might vary slightly but the key is that "Hello" is directly in the DOM).

**Question 1.2:**
A JavaScript alert box popped up saying "XSS!". This happened because the server directly embedded the `<script>alert('XSS!')</script>` tag into the HTML response without any sanitization. The browser then parsed this HTML and executed the embedded script.

**Question 1.3:**
An alert box popped up saying "Image XSS". This demonstrates that XSS payloads can come in many forms, not just `<script>` tags. The `onerror` attribute of the `<img>` tag executes JavaScript if the image fails to load (which it will, as `src=x` is an invalid URL).

**Question 1.4:**
Nothing happened; no alert box. The script did not execute because the server properly sanitized/escaped the user input before embedding it into the HTML.

**Question 1.5:**
The `<script>` tag is rendered as `&lt;script&gt;alert(&#39;XSS!&#39;)&lt;/script&gt;`. The `<%= ... %>` EJS tag automatically HTML-escapes special characters like `<`, `>`, `'`, and `"`, turning them into their HTML entity equivalents. This prevents the browser from interpreting them as executable code.

### Part 2: Stored XSS Answers

**Question 2.1:**
The message "This is a test message." is displayed as plain text on the page.

**Question 2.2:**
Immediately after posting, an alert box popped up saying "Stored XSS!". If you refresh the page or open it in another tab, the alert will reappear. This is because the malicious script was stored on the server (in `messages.json`) and is now delivered to every user who views that page, executing in their browser.

**Question 2.3:**
An alert box saying "Stored Image XSS" appears. Similar to reflected XSS, this shows that stored XSS can leverage various HTML tags and attributes to execute code.

**Question 2.4:**
Nothing happened; no alert box. The script did not execute.

**Question 2.5:**
The `<script>` tag is displayed as `&lt;script&gt;alert(&#39;Stored XSS!&#39;)&lt;/script&gt;`. The EJS rendering for the safe endpoint uses `<%= ... %>`, which HTML-escapes the stored messages, preventing the browser from interpreting them as active content.

### Part 3: SQL Injection (SQLi) Answers

**Question 3.1:**
`SELECT id, name FROM users WHERE name = 'admin'`

**Question 3.2:**
All users in the database (`admin`, `user1`, `user2`) were displayed. The injection worked because the server directly concatenated the user input into the SQL query. The executed query became something like: `SELECT id, name FROM users WHERE name = 'admin' OR '1'='1' -- '`. The `' OR '1'='1'` part makes the WHERE clause always true, and `--` comments out the rest of the original query, effectively returning all entries.

**Question 3.3:**
(Depends on the database and specific payload. For SQLite, this might reveal table schema or internal data.) It would likely return an error indicating a syntax issue or an empty result, or if refined, could expose the database schema by querying `sqlite_master`. For example, `admin' UNION SELECT 1, name, sql FROM sqlite_master --` could reveal table and index definitions.

**Question 3.4:**
`SELECT id, name FROM users WHERE name = ?` (with `?` being a placeholder). It differs because it uses a parameterized query, where user input is treated as a literal value for the parameter, not as executable SQL code.

**Question 3.5:**
It did not work. The search returned "No user found with name: `admin' OR '1'='1' --`". This is because the parameterized query treats the entire input string `admin' OR '1'='1' --` as a single literal username to search for, rather than parsing it as separate SQL commands. Since no user with that exact literal name exists, no results are returned.

### Part 4: API Endpoint Answers

**Question 4.1:**
Output: `{"ok":true,"query":"test_query","safe":"test_query"}`. The `safe` field (in a real-world scenario) would contain a version of the query string that has been properly sanitized or encoded for various contexts (e.g., URL encoding, HTML escaping).

**Question 4.2:**
Output: `{"ok":true,"query":"<script>alert(1)</script>","safe":"%3Cscript%3Ealert(1)%3C/script%3E"}`.
The XSS payload *is* reflected in the `query` field, but it is HTML-escaped/URL-encoded in the `safe` field (`%3C` for `<`, etc.).
It's important for an API to handle potentially malicious input even if it's not rendering HTML directly because:
1.  The API's output might be consumed by a web application that *does* render HTML, leading to XSS if the API doesn't sanitize.
2.  Malicious input could be used for other attacks, like command injection, if the API uses the input in backend commands.
3.  Logging unsanitized input could make logs vulnerable to log injection attacks.
4.  It demonstrates good security practice by not trusting any user input.