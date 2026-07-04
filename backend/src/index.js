require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const areasRoutes = require('./routes/areas.routes');
const projectsRoutes = require('./routes/projects.routes');
const statsRoutes = require('./routes/stats.routes');
const chatRoutes = require('./routes/chat.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

if ((process.env.NODE_ENV || 'development') !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/areas', areasRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/stats', statsRoutes);
// chat.routes.js defines both GET /providers and POST /chat, mounted here
// under /api so the final paths are /api/providers and /api/chat.
app.use('/api', chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Tax-Payers backend listening on port ${PORT}`);
  });
}

module.exports = app;
