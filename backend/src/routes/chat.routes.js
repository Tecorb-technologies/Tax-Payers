const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const providers = require('../services/ai/providers');
const validate = require('../middleware/validate');

const router = express.Router();

// GET /api/providers — supported AI providers, drives the Settings UI.
router.get('/providers', chatController.getProviders);

// POST /api/chat — proxy a single chat turn to the caller's chosen provider.
router.post(
  '/chat',
  validate([
    body('provider')
      .isString()
      .trim()
      .isIn(providers.VALID_PROVIDER_KEYS)
      .withMessage(`provider must be one of: ${providers.VALID_PROVIDER_KEYS.join(', ')}`),
    body('apiKey').optional().isString(),
    body('model').optional().isString().trim().notEmpty(),
    body('projectId').optional().isString().trim().notEmpty(),
    body('messages').isArray({ min: 1 }).withMessage('messages must be a non-empty array'),
    body('messages.*.role').isIn(['user', 'assistant']).withMessage('message role must be user or assistant'),
    body('messages.*.content').isString().trim().notEmpty().withMessage('message content is required'),
  ]),
  chatController.postChat
);

module.exports = router;
