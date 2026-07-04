const projectsService = require('../projects.service');
const areasService = require('../areas.service');
const providers = require('./providers');

const BASE_SYSTEM_PROMPT =
  'You are a helpful assistant embedded in Tax-Payers, a public spending transparency ' +
  'platform. Answer questions about government infrastructure projects clearly, ' +
  'factually, and concisely, using only the context provided below. If you do not have ' +
  'enough information to answer, say so honestly instead of guessing.';

function formatCurrency(amount, currency) {
  if (typeof amount !== 'number') return 'unknown';
  return `${currency ? `${currency} ` : ''}${amount.toLocaleString('en-IN')}`;
}

/**
 * Build a system prompt summarizing a specific project (and its area) so
 * the AI can answer questions about the project the user is currently
 * viewing. This is the single source of truth for what project context
 * gets sent to the AI — the frontend just passes a `projectId`.
 */
function buildProjectContext(project, area) {
  const lines = [
    BASE_SYSTEM_PROMPT,
    '',
    'The user is currently viewing the following project. Use these facts to answer their questions:',
    `- Name: ${project.name}`,
    `- Type: ${project.type}`,
    `- Status: ${project.status}`,
    `- Budget: ${formatCurrency(project.budget, project.currency)}`,
    `- Spent so far: ${formatCurrency(project.spent, project.currency)}`,
    `- Contractor: ${project.contractor || 'Not specified'}`,
  ];

  if (area) {
    lines.push(`- Area: ${area.name}, ${area.city}, ${area.state}`);
  }

  if (Array.isArray(project.spendingBreakdown) && project.spendingBreakdown.length > 0) {
    lines.push('', 'Spending breakdown:');
    project.spendingBreakdown.forEach((item) => {
      lines.push(`- ${item.category}: ${formatCurrency(item.amount, project.currency)}`);
    });
  }

  if (Array.isArray(project.updates) && project.updates.length > 0) {
    lines.push('', 'Recent updates (most recent last):');
    project.updates.forEach((update) => {
      lines.push(`- ${update.date} — ${update.title}: ${update.note}`);
    });
  }

  return lines.join('\n');
}

/**
 * Resolve the system prompt for a chat request. Throws a 404 if a
 * `projectId` is supplied but doesn't reference a real project.
 */
function buildSystemPrompt(projectId) {
  if (!projectId) {
    return BASE_SYSTEM_PROMPT;
  }

  const project = projectsService.getProjectById(projectId);
  if (!project) {
    const error = new Error(`Project '${projectId}' not found`);
    error.status = 404;
    throw error;
  }

  const area = areasService.getAreaById(project.areaId);
  return buildProjectContext(project, area);
}

/**
 * Orchestrate a single chat turn: validate the provider config, build
 * project context (if any), and dispatch to the right adapter.
 *
 * `apiKey` is used only for the duration of this call — it is never
 * logged, cached, or written anywhere.
 *
 * @param {Object} params
 * @param {string} params.provider
 * @param {string} [params.apiKey]
 * @param {string} [params.model]
 * @param {string} [params.projectId]
 * @param {Array<{role: string, content: string}>} params.messages
 * @returns {Promise<{reply: string}>}
 */
async function sendChatMessage({ provider, apiKey, model, projectId, messages }) {
  const config = providers.getProviderConfig(provider);
  if (!config) {
    const error = new Error(`Unsupported provider '${provider}'`);
    error.status = 400;
    throw error;
  }

  if (config.requiresApiKey && !apiKey) {
    const error = new Error(`Provider '${provider}' requires an API key`);
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    const error = new Error('messages must be a non-empty array');
    error.status = 400;
    throw error;
  }

  const system = buildSystemPrompt(projectId);

  const reply = await providers.dispatch(provider, { apiKey, model, system, messages });

  return { reply };
}

module.exports = { sendChatMessage, buildSystemPrompt };
