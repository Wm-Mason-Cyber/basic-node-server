# basic-node-server

A classroom-ready Node.js Express server designed for teaching web basics and cybersecurity concepts, specifically XSS and SQL injection. This project includes intentionally vulnerable code alongside safe implementations to demonstrate security principles.

**WARNING: This server contains intentionally vulnerable code for classroom use only — do NOT deploy publicly.**

## Setup and Runbook

### Install Dependencies
Navigate to the project root and install the necessary Node.js packages:
```bash
npm install
```

### Run Locally
To start the server locally (it will run on `http://localhost:3000` by default):
```bash
npm start
```
The server will log verbose information to the console and to `logs/application-%DATE%.log`.

### Run Tests
Execute the test suite using Jest and Supertest:
```bash
npm test
```

### Docker Build and Run
Build the Docker image and run the container:
```bash
docker build -t node-basics-demo .
docker run --rm -p 3000:3000 node-basics-demo
```
Docker logs will also include the verbose application logs.

### Reset Data
To clear any persisted data (e.g., messages for stored XSS, SQLite database):
```bash
npm run reset-data
```

## Project Structure

- `src/`: Application source code.
    - `app.js`: Main Express application setup, logging, and server start.
    - `routes.js`: Defines all application routes and their handlers.
    - `helpers.js`: Utility functions, including future escaping/sanitizing helpers.
- `node_views/`: EJS templates for rendering dynamic content.
- `node_static/`: Static assets (CSS, JS, images).
- `data/`: Persisted data storage (e.g., `messages.json`, `node_demo.db`).
- `tests/`: Unit and integration tests using Jest and Supertest.
- `scripts/`: Helper scripts (e.g., `reset_data.sh`).
- `.github/workflows/`: GitHub Actions for Continuous Integration.
- `docs/`: Project documentation and teaching materials.
    - `WORKSHEET.md`: Student tasks and exercises.
    - `PROJECT_GOALS.md`: High-level goals for the project.
    - `TEST_PLAN.md`: Details on testing strategy.

## Endpoints

- `GET /` — Index page with navigation.
- **Reflected XSS:**
    - `GET /vuln_reflected?q=...` — Intentionally renders `q` unsanitized (vulnerable).
    - `GET /safe_reflected?q=...` — Renders `q` safely (EJS escaped).
- **Stored XSS:**
    - `GET` & `POST` `/stored_vuln` — Stores posts in `data/messages.json` and displays them unsafely (vulnerable).
    - `GET` & `POST` `/stored_safe` — Same storage but displays escaped (safe).
- **SQLi:**
    - `GET /sql_vuln?name=...` — Constructs SQL by concatenation (vulnerable).
    - `GET /sql_safe?name=...` — Uses parameterized queries (safe).
- **API:**
    - `GET /api/search?q=...` — Returns JSON `{ ok: true, query: q, safe: escaped }`.