const areas = require('../models/areas.data');

/**
 * Return all areas.
 */
function listAreas() {
  return areas;
}

/**
 * Find a single area by id, or null if not found.
 */
function getAreaById(id) {
  return areas.find((area) => area.id === id) || null;
}

module.exports = {
  listAreas,
  getAreaById,
};
