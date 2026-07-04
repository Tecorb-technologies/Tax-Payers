const express = require('express');
const { query, param } = require('express-validator');
const projectsController = require('../controllers/projects.controller');
const projectsService = require('../services/projects.service');
const validate = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  validate([
    query('areaId').optional().isString().trim().notEmpty(),
    query('type').optional().isIn(projectsService.VALID_TYPES),
    query('status').optional().isIn(projectsService.VALID_STATUSES),
    query('q').optional().isString().trim().isLength({ max: 200 }),
  ]),
  projectsController.getProjects
);

router.get(
  '/:id',
  validate([param('id').isString().trim().notEmpty()]),
  projectsController.getProjectById
);

module.exports = router;
