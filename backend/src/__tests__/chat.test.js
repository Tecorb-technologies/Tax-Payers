const request = require('supertest');
const app = require('../index');
const projects = require('../models/projects.data');

function mockFetchOnce({ ok = true, status = 200, json }) {
  return jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: async () => json,
  });
}

describe('POST /api/chat', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a reply from Anthropic on success', async () => {
    const fetchSpy = mockFetchOnce({
      json: { content: [{ type: 'text', text: 'Hello, I can help with that.' }] },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'anthropic',
        apiKey: 'sk-ant-fake-key',
        messages: [{ role: 'user', content: 'What is this app about?' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Hello, I can help with that.');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe('sk-ant-fake-key');
    expect(options.headers['anthropic-version']).toBe('2023-06-01');
  });

  it('returns a reply from an OpenAI-compatible provider on success', async () => {
    const fetchSpy = mockFetchOnce({
      json: { choices: [{ message: { content: 'Sure, here is an answer.' } }] },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'openai',
        apiKey: 'sk-fake-openai-key',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Summarize this project.' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Sure, here is an answer.');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(options.headers.Authorization).toBe('Bearer sk-fake-openai-key');

    const body = JSON.parse(options.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages[0]).toEqual({ role: 'system', content: expect.any(String) });
  });

  it('never logs or echoes the caller-supplied API key back in the response', async () => {
    mockFetchOnce({
      json: { choices: [{ message: { content: 'Response text' } }] },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'openai',
        apiKey: 'sk-super-secret-key',
        messages: [{ role: 'user', content: 'Hi' }],
      });

    expect(JSON.stringify(res.body)).not.toContain('sk-super-secret-key');
  });

  it('returns 400 when provider is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'Hi' }] });

    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'provider')).toBe(true);
  });

  it('returns 400 when messages is missing or empty', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ provider: 'anthropic', apiKey: 'sk-ant-fake-key', messages: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'messages')).toBe(true);
  });

  it('returns 400 for an unknown provider', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'not-a-real-provider',
        apiKey: 'whatever',
        messages: [{ role: 'user', content: 'Hi' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'provider')).toBe(true);
  });

  it('maps a provider auth failure (401) to a clean mapped error without leaking the key', async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      json: { error: { message: 'invalid x-api-key' } },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'anthropic',
        apiKey: 'sk-ant-totally-fake-key',
        messages: [{ role: 'user', content: 'Hi' }],
      });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('invalid x-api-key');
    expect(JSON.stringify(res.body)).not.toContain('sk-ant-totally-fake-key');
  });

  it('maps a provider rate-limit failure (429) straight through', async () => {
    mockFetchOnce({
      ok: false,
      status: 429,
      json: { error: { message: 'rate limit exceeded' } },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'openai',
        apiKey: 'sk-fake-openai-key',
        messages: [{ role: 'user', content: 'Hi' }],
      });

    expect(res.status).toBe(429);
  });

  it('builds project context into the system prompt when projectId is supplied', async () => {
    const project = projects.find((p) => p.id === 'prj-blr-01');
    const fetchSpy = mockFetchOnce({
      json: { content: [{ type: 'text', text: 'This project is on track.' }] },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'anthropic',
        apiKey: 'sk-ant-fake-key',
        projectId: project.id,
        messages: [{ role: 'user', content: 'How much has been spent so far?' }],
      });

    expect(res.status).toBe(200);

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.system).toContain(project.name);
    expect(body.system).toContain(project.budget.toLocaleString('en-IN'));
    expect(body.system).toContain(project.contractor);
  });

  it('returns 404 when projectId does not reference a real project', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'anthropic',
        apiKey: 'sk-ant-fake-key',
        projectId: 'does-not-exist',
        messages: [{ role: 'user', content: 'Hi' }],
      });

    expect(res.status).toBe(404);
  });
});
