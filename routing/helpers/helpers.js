const accountHelper = require('./accountHelpers')
const authHelper = require('./authHelpers')
const bucketHelper = require('./bucketHelpers')
const getQuery = require('./getQuery')
const groupHelpers = require('./groupHelpers')
const miscHelpers = require('./miscHelpers')
const bucketHelpers = require('./bucketHelpers')
const macheHelpers = require('./macheHelpers')


const buildHelpers = (modules) => {
  const functionKeys = {}
  const helper = {}
  modules.forEach( mod => {
    for ( functionKey in mod ) {
      if ( functionKeys.hasOwnProperty(functionKey) ) { throw new Error('Helper aggregation namespace error'); }
      else {
        functionKeys[functionKey] = true;
        helper[functionKey] = mod[functionKey]
      }

    }
  })
  return helper;
}


module.exports = buildHelpers([ accountHelper, authHelper, getQuery, groupHelpers, miscHelpers, bucketHelpers, macheHelpers])
