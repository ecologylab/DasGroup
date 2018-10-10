//I dont suspect this will ever become huge enough to make the import of the aggregation too hefty
//A helper means it is not the direction reciever of a request or response
//Helpers can only depend on other helpers and models / node_modules
const authHelper = require('./authHelper');
const getQuery = require('./queryHelper');
const accountHelper = require('./accountHelper');
const bucketHelper = require('./bucketHelper');
const groupHelper = require('./groupHelper')
const logger = require('./logger')

const buildHelpers = (mods) => {
  const helpers = {};
  const functionKeys = {};
  //where a goodie is a {functionName : function}
  const extractGoodies = (mod) => {
    const goodies = [];
    for( functionKey in mod) {
      goodies.push( {functionKey : functionKey, funct : mod[functionKey] } )
      if ( functionKeys.hasOwnProperty(functionKey) === false ) {
        functionKeys[functionKey] = true;
      } else {
        logger.error('Error in build helpers - duplicate function error')
      }
      functionKeys.push(functionKey)
    }
    return goodies;
  }

  mods.forEach( mod => {
    const goodies = extractGoodies(mod)
    goodies.forEach( goodie => {
      helpers[goodie.functionKey] = goodie.funct
    })
  })
  return helpers;
}



module.exports = buildHelpers([authHelper, getQuery, accountHelper, bucketHelper, groupHelper])
