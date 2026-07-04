const { validationResult } = require('express-validator');

/**
 * Wraps an array of express-validator validation chains. Runs them all,
 * then short-circuits with a clean 400 JSON error if any failed —
 * keeping request validation centralized at the API boundary instead of
 * scattered checks inside controllers.
 *
 * Usage: router.get('/', validate([query('type').optional().isIn([...])]), controller)
 */
function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const error = new Error('Invalid request parameters');
    error.status = 400;
    error.details = result.array().map((e) => ({ field: e.path, message: e.msg }));
    next(error);
  };
}

module.exports = validate;
