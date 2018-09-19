const logger = require('../utils/logger');

logger.log({ level : 'error', message : 'Test error level log' })
logger.log({ level : 'warning', message : 'Test warning level log' })
logger.log({ level : 'info', message : 'Test info level log' })
logger.log({ level : 'notice', message : 'Test notice level log' })
