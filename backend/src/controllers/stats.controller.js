const statsService = require('../services/stats.service');
const areasService = require('../services/areas.service');

/**
 * GET /api/stats?areaId=
 * If areaId is provided it must reference an existing area (404 otherwise).
 * If omitted, returns aggregate stats across all areas/projects.
 */
function getStats(req, res, next) {
  try {
    const { areaId } = req.query;

    if (areaId !== undefined) {
      const area = areasService.getAreaById(areaId);
      if (!area) {
        const error = new Error(`Area '${areaId}' not found`);
        error.status = 404;
        throw error;
      }
      return res.json({ data: statsService.getStatsForArea(areaId) });
    }

    res.json({ data: statsService.getGlobalStats() });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
