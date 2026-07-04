/**
 * 404 handler for unmatched routes. Placed after all route mounts.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

/**
 * Centralized error handler. Any controller/service can throw (or call
 * `next(error)` with) an Error that optionally has a `status` property;
 * this normalizes the response shape and status code.
 *
 * Must be registered last, with 4 arguments, so Express treats it as
 * an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  if (status >= 500) {
    console.error(err);
  }

  const body = { error: { message } };
  if (err.details) {
    body.error.details = err.details;
  }

  res.status(status).json(body);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
