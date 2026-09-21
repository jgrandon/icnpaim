const pino = require('pino');
const LOG_DIRECTORY = process.env.LOG_DIRECTORY
const NODE_ENV = process.env.NODE_ENV

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: LOG_DIRECTORY + '/app.log', mkdir: true },
    },
    {
      target: 'pino/file',
      options: { destination: 1 }, // also stdout for PM2
    },
  ],
});

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  env: NODE_ENV,
}, transport);

module.exports = logger;