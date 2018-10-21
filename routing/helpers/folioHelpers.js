const logger = require('./logger')
const Folio = require('../../models/folio')
const folioHelpers = {}

const findFolio = (query) => {
  query.visibility = { $ne : 'removed' }
  return new Promise( (resolve, reject) => {
    Folio.find(query).exec()
    .then( (folio) => {
      if ( folio.length === 1 ) { resolve(folio[0]) }
      else if ( folio.length < 1 ) { reject('No folio found')}
      else { resolve(folio); }
    })
    .catch( e => {
      logger.error('Error in findFolio %j %O', query, e)
      reject(e);
    })
  })
}







folioHelpers.findFolio = findFolio;
module.exports = folioHelpers;
