const projectsService = require('../services/projects.service');
const areasService = require('../services/areas.service');

/**
 * GET /api/projects?areaId=&type=&status=&q=
 */
function getProjects(req, res, next) {
  try {
    const { areaId, type, status, q } = req.query;

    // Format/enum validity of type/status/areaId/q is enforced by the
    // express-validator chains on the route. This remaining check is a
    // business rule (does the referenced area actually exist), not a
    // format check, so it belongs here rather than in route validation.
    if (areaId !== undefined && !areasService.getAreaById(areaId)) {
      const error = new Error(`Area '${areaId}' not found`);
      error.status = 404;
      throw error;
    }

    const data = projectsService.listProjects({ areaId, type, status, q });

    res.json({ data, meta: { count: data.length } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects/:id
 */
function getProjectById(req, res, next) {
  try {
    const project = projectsService.getProjectById(req.params.id);

    if (!project) {
      const error = new Error(`Project '${req.params.id}' not found`);
      error.status = 404;
      throw error;
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getProjectById,
};
