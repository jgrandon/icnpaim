import config from './config';

const pino = require('pino');

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: './logs/app.log', mkdir: true },
    },
    {
      target: 'pm2',
      options: { destination: 1 }, // also stdout for PM2
    },
  ],
});

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
}, transport);

module.exports = logger;