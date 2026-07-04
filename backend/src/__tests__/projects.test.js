const request = require('supertest');
const app = require('../index');
const areas = require('../models/areas.data');
const projects = require('../models/projects.data');

describe('GET /api/projects', () => {
  it('returns all seeded projects when no filters are applied', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(projects.length);
    expect(res.body.meta.count).toBe(projects.length);
  });

  it('filters by areaId', async () => {
    const areaId = areas[0].id;

    const res = await request(app).get('/api/projects').query({ areaId });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.areaId === areaId)).toBe(true);
  });

  it('returns 404 when areaId does not reference a real area', async () => {
    const res = await request(app)
      .get('/api/projects')
      .query({ areaId: 'not-a-real-area' });

    expect(res.status).toBe(404);
  });

  it('filters by type', async () => {
    const res = await request(app).get('/api/projects').query({ type: 'bridge' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.type === 'bridge')).toBe(true);
  });

  it('rejects an invalid type with 400', async () => {
    const res = await request(app).get('/api/projects').query({ type: 'spaceship' });

    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'type')).toBe(true);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/projects').query({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.status === 'completed')).toBe(true);
  });

  it('rejects an invalid status with 400', async () => {
    const res = await request(app).get('/api/projects').query({ status: 'cancelled' });

    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'status')).toBe(true);
  });

  it('performs a case-insensitive free-text search on name/description', async () => {
    const res = await request(app).get('/api/projects').query({ q: 'flyover' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every(
        (p) =>
          p.name.toLowerCase().includes('flyover') ||
          p.description.toLowerCase().includes('flyover')
      )
    ).toBe(true);
  });

  it('combines multiple filters', async () => {
    const areaId = 'kothrud-pune';

    const res = await request(app)
      .get('/api/projects')
      .query({ areaId, status: 'in-progress' });

    expect(res.status).toBe(200);
    expect(
      res.body.data.every((p) => p.areaId === areaId && p.status === 'in-progress')
    ).toBe(true);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns full project detail including breakdown and updates', async () => {
    const target = projects[0];

    const res = await request(app).get(`/api/projects/${target.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(target.id);
    expect(Array.isArray(res.body.data.spendingBreakdown)).toBe(true);
    expect(Array.isArray(res.body.data.updates)).toBe(true);
  });

  it('returns 404 for an unknown project id', async () => {
    const res = await request(app).get('/api/projects/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});
