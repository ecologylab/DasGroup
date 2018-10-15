const config = require('config')
const logger = require('./logger')


module.exports.isNotProd = (req, res, next) => {
  if ( !process.env.NODE_ENV.includes('prod') ) {
    next()
  } else {
    logger.notice('An attempt to use a test route was made in a production environment')
    res.redirect('/')
  }
}
