const request = require('supertest');
const app = require('../index');
const areas = require('../models/areas.data');
const projects = require('../models/projects.data');

describe('GET /api/stats', () => {
  it('returns global aggregates when no areaId is given', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.projectCount).toBe(projects.length);
    expect(res.body.data.totalBudget).toBeGreaterThan(0);
    expect(res.body.data.totalSpent).toBeGreaterThan(0);
    expect(typeof res.body.data.spendByType).toBe('object');
    expect(typeof res.body.data.spendByStatus).toBe('object');
  });

  it('returns aggregates scoped to a single area', async () => {
    const areaId = areas[0].id;
    const expectedProjects = projects.filter((p) => p.areaId === areaId);

    const res = await request(app).get('/api/stats').query({ areaId });

    expect(res.status).toBe(200);
    expect(res.body.data.projectCount).toBe(expectedProjects.length);

    const expectedBudget = expectedProjects.reduce((sum, p) => sum + p.budget, 0);
    expect(res.body.data.totalBudget).toBe(expectedBudget);
  });

  it('returns 404 for an unknown areaId', async () => {
    const res = await request(app).get('/api/stats').query({ areaId: 'nope' });

    expect(res.status).toBe(404);
  });
});
