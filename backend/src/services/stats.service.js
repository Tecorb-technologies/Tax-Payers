const { getProjectsByAreaId } = require('./projects.service');
const projects = require('../models/projects.data');

/**
 * Build aggregate spending stats from a list of projects:
 * total budget, total spent, spend-by-type, spend-by-status, project count.
 */
function buildStats(projectList) {
  const stats = {
    projectCount: projectList.length,
    totalBudget: 0,
    totalSpent: 0,
    spendByType: {},
    spendByStatus: {},
  };

  for (const project of projectList) {
    stats.totalBudget += project.budget;
    stats.totalSpent += project.spent;

    stats.spendByType[project.type] =
      (stats.spendByType[project.type] || 0) + project.spent;

    stats.spendByStatus[project.status] =
      (stats.spendByStatus[project.status] || 0) + project.spent;
  }

  return stats;
}

/**
 * Compute aggregate stats for a single area's projects.
 * Caller is responsible for confirming the area itself exists.
 */
function getStatsForArea(areaId) {
  return buildStats(getProjectsByAreaId(areaId));
}

/**
 * Compute aggregate stats across every project (all areas).
 */
function getGlobalStats() {
  return buildStats(projects);
}

module.exports = {
  buildStats,
  getStatsForArea,
  getGlobalStats,
};
