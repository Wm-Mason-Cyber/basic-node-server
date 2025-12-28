const request = require('supertest');
const app = require('../src/app');
const { initDb, closeDb, getDb } = require('../src/helpers'); // Import initDb, closeDb, and getDb

describe('SQL Injection Endpoints', () => {
    beforeAll(async () => {
        // Ensure the data directory exists before any DB operations
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        await request(app).get('/reset-data'); // Clean up any existing data
        await initDb(); // Initialize DB once for all tests
    });

    beforeEach(async () => {
        // Clear and re-seed the database before each test
        const db = getDb();
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('DELETE FROM users', (err) => {
                    if (err) return reject(err);
                    db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["admin", "adminpass"], (err) => {
                        if (err) return reject(err);
                        db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user1", "pass123"], (err) => {
                            if (err) return reject(err);
                            db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user2", "securepass"], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });

    afterAll(async () => {
        await closeDb(); // Close the database connection after all tests
        await request(app).get('/reset-data'); // Final cleanup
    });

    // Test for vulnerable SQLi
    test('GET /sql_vuln should be vulnerable to "OR 1=1" injection', async () => {
        // ' OR '1'='1 --
        const injectedName = `admin' OR '1'='1' --`;
        const res = await request(app).get(`/sql_vuln?name=${encodeURIComponent(injectedName)}`);
        expect(res.statusCode).toEqual(200);
        // When db.all is used for vulnerable endpoint, it should return all users
        expect(res.text).toContain('Users Found:');
        expect(res.text).toContain('<li><strong>admin</strong> (ID:');
        expect(res.text).toContain('<li><strong>user1</strong> (ID:');
        expect(res.text).toContain('<li><strong>user2</strong> (ID:');
    });

    test('GET /sql_vuln should be vulnerable to finding other users with valid input', async () => {
        const injectedName = `user1`;
        const res = await request(app).get(`/sql_vuln?name=${encodeURIComponent(injectedName)}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Users Found:');
        expect(res.text).toContain('<li><strong>user1</strong> (ID:');
    });

    // Test for safe SQLi
    test('GET /sql_safe should not be vulnerable to "OR 1=1" injection', async () => {
        const injectedName = `admin' OR '1'='1' --`;
        const htmlEscapedInjectedName = `admin&#39; OR &#39;1&#39;=&#39;1&#39; --`; // Manually HTML escape for the assertion
        const res = await request(app).get(`/sql_safe?name=${encodeURIComponent(injectedName)}`);
        expect(res.statusCode).toEqual(200);
        // Expect that the injected string itself is treated as a literal name and not found
        expect(res.text).toContain(`No user found with name: <strong>${htmlEscapedInjectedName}</strong>`);
    });

    test('GET /sql_safe should find a valid user', async () => {
        const validName = 'user2';
        const res = await request(app).get(`/sql_safe?name=${encodeURIComponent(validName)}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('User Found: <strong>user2</strong>'); // Should find user2
    });

    test('GET /sql_safe should not find a non-existent user', async () => {
        const nonExistentName = 'nonexistent';
        const res = await request(app).get(`/sql_safe?name=${encodeURIComponent(nonExistentName)}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain(`No user found with name: <strong>${nonExistentName}</strong>`);
    });
});
