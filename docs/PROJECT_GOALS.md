# Project Goals for Basic Node.js Server

This project serves as an educational tool for high school cybersecurity students to understand fundamental web technologies, common web vulnerabilities (XSS and SQL Injection), and basic security practices.

## Core Objectives:

1.  **Illustrate Web Basics:** Provide a functional, simple Node.js Express server that students can easily run, inspect, and modify.
2.  **Demonstrate XSS (Cross-Site Scripting):**
    *   Show both Reflected and Stored XSS vulnerabilities.
    *   Clearly distinguish between vulnerable implementations (direct rendering of user input) and safe implementations (using proper HTML escaping).
    *   Educate on the impact of XSS (e.g., cookie theft, session hijacking, defacement).
3.  **Demonstrate SQL Injection (SQLi):**
    *   Show SQLi vulnerabilities through a simple user lookup scenario.
    *   Clearly distinguish between vulnerable implementations (string concatenation for SQL queries) and safe implementations (using parameterized queries).
    *   Educate on the impact of SQLi (e.g., unauthorized data access, data modification, authentication bypass).
4.  **Promote Secure Coding Practices:**
    *   Highlight the importance of input validation and output encoding.
    *   Introduce concepts of parameterized queries as a defense mechanism.
5.  **Provide Classroom-Ready Materials:**
    *   Include a `WORKSHEET.md` with guided exercises for students.
    *   Ensure the codebase is well-commented, especially marking intentionally vulnerable lines.
    *   Offer clear setup and run instructions.
6.  **Emphasize Logging:**
    *   Implement verbose logging to both console (for Docker visibility) and a file (for analysis).
    *   Show how server-side logs can reveal attack attempts or debugging information.
7.  **Containerization Basics:**
    *   Provide a Dockerfile to introduce students to containerization, allowing consistent environments.
8.  **Automated Testing:**
    *   Include Jest and Supertest for basic automated testing, demonstrating how tests can verify both functionality and security aspects (i.e., that safe endpoints actually prevent injection).
9.  **CI/CD Introduction:**
    *   Implement a basic GitHub Actions workflow to introduce continuous integration concepts, ensuring tests run automatically.

## Non-Goals / Explicit Constraints:

*   This is **not** a production-ready application. It is intentionally simplistic and contains known vulnerabilities for educational purposes only.
*   **No Deployment:** It is strictly for local classroom use and should never be deployed publicly.
*   **No Advanced Security Features:** Focus is on fundamental vulnerabilities, not comprehensive security frameworks.
*   **Local Data Only:** All persistent data (messages, database) must be local to the repository (`data/` directory) and easily reset.
*   **Simplicity Over Scalability/Performance:** Code readability and educational clarity are prioritized over high-performance or scalable solutions.