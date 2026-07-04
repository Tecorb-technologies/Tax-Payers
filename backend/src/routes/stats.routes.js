const express = require('express');
const { query } = require('express-validator');
const statsController = require('../controllers/stats.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  validate([query('areaId').optional().isString().trim().notEmpty()]),
  statsController.getStats
);

module.exports = router;
