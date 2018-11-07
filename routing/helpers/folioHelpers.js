const logger = require('./logger')
const Folio = require('../../models/folio')
const macheHelpers = require('./macheHelpers')
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



folioHelpers.filterFoliosByPermissions = (folios, user, isUserAdmin) => {
  const filterOutAdminOnlys = (folios) => folios.filter( f => f.visibility !== 'adminOnly')
  const filterFolioSubmissionsByPermissions = (folios) => {
    let filteredFolios = folios.map( f => {
      if ( f.transparent !== true ) {
        f.macheSubmissions = f.macheSubmissions.filter( sub => macheHelpers.isUserPartOfMache(sub.mache, user) )
      }
      return f;
    })
    return filteredFolios;
  }
  if ( !isUserAdmin ) {
    folios = filterOutAdminOnlys(folios);
  }
  folios = filterFolioSubmissionsByPermissions(folios);
  return folios;
}



folioHelpers.findFolio = findFolio;
module.exports = folioHelpers;
