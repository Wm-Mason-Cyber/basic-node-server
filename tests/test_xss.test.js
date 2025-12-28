const request = require('supertest');
const app = require('../src/app'); // Adjust path as necessary

describe('XSS Endpoints', () => {
    // Test for vulnerable reflected XSS
    test('GET /vuln_reflected should echo unsanitized input', async () => {
        const payload = "<script>alert('xss')</script>";
        const res = await request(app).get(`/vuln_reflected?q=${payload}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain(payload); // Vulnerable: payload reflected directly
    });

    // Test for safe reflected XSS
    test('GET /safe_reflected should escape input', async () => {
        const payload = "<script>alert('xss')</script>";
        const res = await request(app).get(`/safe_reflected?q=${payload}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).not.toContain(payload); // Safe: payload should be escaped
        expect(res.text).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"); // Check for escaped output
    });

    // Test for vulnerable stored XSS
    test('POST /stored_vuln should store and reflect unsanitized input', async () => {
        const payload = "<img src='x' onerror='alert(\"stored xss\")'>";
        
        // Post the vulnerable message
        await request(app)
            .post('/stored_vuln')
            .send('message=' + payload)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(302); // Expect redirect

        // Retrieve and check if the payload is reflected
        const res = await request(app).get('/stored_vuln');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain(payload); // Vulnerable: payload reflected directly
        
        // Cleanup (optional, but good practice for deterministic tests)
        await request(app).get('/reset-data'); // Assuming a /reset-data endpoint or script
    });

    // Test for safe stored XSS
    test('POST /stored_safe should store and reflect escaped input', async () => {
        const payload = "<img src='x' onerror='alert(\"stored xss\")'>";

        // Post the safe message
        await request(app)
            .post('/stored_safe')
            .send('message=' + payload)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(302); // Expect redirect

        // Retrieve and check if the payload is escaped
        const res = await request(app).get('/stored_safe');
        expect(res.statusCode).toEqual(200);
        expect(res.text).not.toContain(payload); // Safe: payload should be escaped
        expect(res.text).toContain("&lt;img src=&#39;x&#39; onerror=&#39;alert(&#34;stored xss&#34;)&#39;&gt;"); // Check for escaped output
        
        // Cleanup
        await request(app).get('/reset-data');
    });

    // Simple API search test
    test('GET /api/search should return JSON with query', async () => {
        const query = "test_query";
        const res = await request(app).get(`/api/search?q=${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toEqual({ ok: true, query: query, safe: encodeURIComponent(query) });
    });
});

// Helper for resetting data; this would ideally be done via a dedicated endpoint
// or directly manipulating the data files in a test setup/teardown.
// For now, we'll create a dummy route in app.js for testing cleanup.
// This is not ideal for production, but serves testing purposes.
app.get('/reset-data', (req, res) => {
    require('child_process').execSync('npm run reset-data');
    res.send('Data reset.');
});
