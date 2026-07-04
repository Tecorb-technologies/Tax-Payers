const request = require('supertest');
const app = require('../index');

describe('GET /api/health', () => {
  it('returns 200 and an ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('unknown route', () => {
  it('returns a 404 JSON error', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.message).toBe('string');
  });
});
