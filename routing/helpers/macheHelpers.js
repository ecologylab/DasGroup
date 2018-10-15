const logger = require('./logger')
const Mache = require('../../models/mache')
const macheHelpers = {}

const findMache = (query) => {
  return new Promise( (resolve, reject) => {
    Mache.find(query).exec()
    .then( (mache) => {
      if ( mache.length === 1 ) { resolve(mache[0]) }
      else if ( mache.length < 1 ) { reject('No mache found')}
      else { resolve(mache); }
    })
    .catch( e => {
      logger.error('Error in findMache %j %O', query, e)
      reject(e);
    })
  })
}






macheHelpers.findMache = findMache;
module.exports = macheHelpers;
