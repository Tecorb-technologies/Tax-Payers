const request = require('supertest');
const app = require('../index');
const { VALID_PROVIDER_KEYS } = require('../services/ai/providers');

describe('GET /api/providers', () => {
  it('returns the provider registry without exposing internal baseUrl details', async () => {
    const res = await request(app).get('/api/providers');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(VALID_PROVIDER_KEYS.length);

    const keys = res.body.data.map((p) => p.key);
    expect(keys.sort()).toEqual([...VALID_PROVIDER_KEYS].sort());

    res.body.data.forEach((provider) => {
      expect(provider).toHaveProperty('key');
      expect(provider).toHaveProperty('label');
      expect(provider).toHaveProperty('requiresApiKey');
      expect(provider).toHaveProperty('defaultModel');
      expect(provider).not.toHaveProperty('baseUrl');
    });
  });

  it('marks ollama as not requiring an API key and cloud providers as requiring one', async () => {
    const res = await request(app).get('/api/providers');

    const ollama = res.body.data.find((p) => p.key === 'ollama');
    const anthropic = res.body.data.find((p) => p.key === 'anthropic');

    expect(ollama.requiresApiKey).toBe(false);
    expect(anthropic.requiresApiKey).toBe(true);
  });
});
