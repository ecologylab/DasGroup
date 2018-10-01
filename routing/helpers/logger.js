//This is ever so slightly different, but essentially the same as the utils/logger.
//I don't want helpers pulling from utils, just themselves and models
const LogBase = './logs';
const winston = require('winston');
const moment = require('moment');
const { combine, timestamp, label, printf, colorize } = winston.format;

const helperFormat = winston.format.printf(function (info) {
  return `HELPER: ${info.level}: ${info.message} (${moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ')})`;
});


const customLevels = {
  levels: {
    error: 0,
    warning: 1,
    notice: 2,
    test: 3,
    info: 4
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    notice: 'blue',
    test : 'green',
    info: 'grey'
  }
};


module.exports = winston.createLogger({
  levels : customLevels.levels,
  format: combine( timestamp(), winston.format.json() ),
  transports: [
		new winston.transports.Console({
      format: combine(
         colorize({colors : customLevels.colors}),
         winston.format.splat(),
         winston.format.simple(),
         helperFormat
       )
    }),
    new winston.transports.File({
      filename: `${LogBase}/combined.json`,
      level: 'verbose'
    }),
    new winston.transports.File({
      filename:  `${LogBase}/info.json`,
      level: 'info'
    }),
    new winston.transports.File({
      filename:  `${LogBase}/errors.json`,
      level: 'error'
    })
  ]
});
