const accountHelper = require('./accountHelpers')
const authHelper = require('./authHelpers')
const folioHelper = require('./folioHelpers')
const getQuery = require('./getQuery')
const groupHelpers = require('./groupHelpers')
const miscHelpers = require('./miscHelpers')
const folioHelpers = require('./folioHelpers')
const macheHelpers = require('./macheHelpers')
const isNotProd = require('./isNotProd')

//Each file generally requires such a large portion of the helpers that this is easier
//And i do not expect there to ever be so many that there would be namespace errors
const buildHelpers = (modules) => {
  const functionKeys = {}
  const helper = {}
  modules.forEach( mod => {
    for ( let functionKey in mod ) {
      if ( functionKeys.hasOwnProperty(functionKey) ) { throw new Error('Helper aggregation namespace error'); }
      else {
        functionKeys[functionKey] = true;
        helper[functionKey] = mod[functionKey]
      }

    }
  })
  return helper;
}


module.exports = buildHelpers([
  accountHelper, authHelper, getQuery,
  groupHelpers, miscHelpers, folioHelpers,
  macheHelpers, isNotProd
])
