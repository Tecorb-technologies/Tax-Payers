const request = require('supertest');
const app = require('../index');
const areas = require('../models/areas.data');

describe('GET /api/areas', () => {
  it('returns the full list of seeded areas', async () => {
    const res = await request(app).get('/api/areas');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(areas.length);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('center.lat');
    expect(res.body.data[0]).toHaveProperty('center.lng');
  });
});

describe('GET /api/areas/:id', () => {
  it('returns the area with a spending summary', async () => {
    const target = areas[0];

    const res = await request(app).get(`/api/areas/${target.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(target.id);
    expect(res.body.data.summary).toEqual(
      expect.objectContaining({
        projectCount: expect.any(Number),
        totalBudget: expect.any(Number),
        totalSpent: expect.any(Number),
      })
    );
    expect(res.body.data.summary.projectCount).toBeGreaterThan(0);
  });

  it('returns 404 for an unknown area id', async () => {
    const res = await request(app).get('/api/areas/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});
