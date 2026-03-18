const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/environment');
const logger = require('./utils/logger');

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`OrderFlow server running on port ${config.port} in ${config.env} mode`);
  });
};

startServer();
