const LogBase = './logs';
const winston = require('winston');
const moment = require('moment');
const { combine, timestamp, label, printf, colorize } = winston.format;

const myConsoleFormat = winston.format.printf(function (info) {
  return `${info.level}: ${info.message} (${moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ')})`;
});


const customLevels = {
  levels: {
    error: 0,
    warning: 1,
    notice: 2,
    info: 3
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    notice: 'blue',
    info: 'green'
  }
};


module.exports = winston.createLogger({
  levels : customLevels.levels,
  format: combine( timestamp(), winston.format.json() ),
  transports: [
		new winston.transports.Console({
      format: combine( colorize({colors : customLevels.colors}), myConsoleFormat )
    }),
    new winston.transports.File({
      filename: `${LogBase}/combined.log`,
      level: 'verbose'
    }),
    new winston.transports.File({
      filename:  `${LogBase}/info.log`,
      level: 'info'
    }),
    new winston.transports.File({
      filename:  `${LogBase}/errors.log`,
      level: 'error'
    })
  ]
});
