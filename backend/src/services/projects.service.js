const projects = require('../models/projects.data');

const VALID_TYPES = ['road', 'building', 'bridge', 'park', 'utility'];
const VALID_STATUSES = ['planned', 'in-progress', 'completed'];

/**
 * List projects, optionally filtered by areaId, type, status and a
 * free-text search (`q`) matched case-insensitively against name/description.
 *
 * This is the single source of truth for project filtering rules —
 * the frontend should not re-implement this logic.
 *
 * @param {Object} filters
 * @param {string} [filters.areaId]
 * @param {string} [filters.type]
 * @param {string} [filters.status]
 * @param {string} [filters.q]
 */
function listProjects({ areaId, type, status, q } = {}) {
  let results = projects;

  if (areaId) {
    results = results.filter((project) => project.areaId === areaId);
  }

  if (type) {
    results = results.filter((project) => project.type === type);
  }

  if (status) {
    results = results.filter((project) => project.status === status);
  }

  if (q) {
    const needle = q.trim().toLowerCase();
    if (needle) {
      results = results.filter(
        (project) =>
          project.name.toLowerCase().includes(needle) ||
          project.description.toLowerCase().includes(needle)
      );
    }
  }

  return results;
}

/**
 * Find a single project by id, or null if not found.
 */
function getProjectById(id) {
  return projects.find((project) => project.id === id) || null;
}

/**
 * Get all projects for a given area id (used by the stats service).
 */
function getProjectsByAreaId(areaId) {
  return projects.filter((project) => project.areaId === areaId);
}

module.exports = {
  VALID_TYPES,
  VALID_STATUSES,
  listProjects,
  getProjectById,
  getProjectsByAreaId,
};
