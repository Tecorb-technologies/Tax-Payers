const express = require('express');
const { param } = require('express-validator');
const areasController = require('../controllers/areas.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', areasController.getAreas);
router.get(
  '/:id',
  validate([param('id').isString().trim().notEmpty()]),
  areasController.getAreaById
);

module.exports = router;
