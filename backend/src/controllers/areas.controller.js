const areasService = require('../services/areas.service');
const statsService = require('../services/stats.service');

/**
 * GET /api/areas
 */
function getAreas(req, res) {
  res.json({ data: areasService.listAreas() });
}

/**
 * GET /api/areas/:id
 * Returns the area plus a spending summary (total budget/spent, project count).
 */
function getAreaById(req, res, next) {
  try {
    const area = areasService.getAreaById(req.params.id);

    if (!area) {
      const error = new Error(`Area '${req.params.id}' not found`);
      error.status = 404;
      throw error;
    }

    const summary = statsService.getStatsForArea(area.id);

    res.json({
      data: {
        ...area,
        summary: {
          projectCount: summary.projectCount,
          totalBudget: summary.totalBudget,
          totalSpent: summary.totalSpent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAreas,
  getAreaById,
};
