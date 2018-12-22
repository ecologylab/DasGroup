process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose')
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Folio = require('../../models/folio');
const Clipping = require('../../models/clipping');
const Element = require('../../models/element');
const Role = require('../../models/role');
const jsonfile = require('jsonfile')
const moment = require('moment')
const { extractMaches, extractElements, extractClippings, macheExtractor, avg, min, max, ...helpers } = require('../helpers')
const macheAnalytics = require('../macheAnalytics')



mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database. Running analytics"); run()  },
  err => { console.log("ERROR - Database connection failed")}
)




const test_elementCountsByUser = (deepMaches) => {
  const elementCountsByUser = macheAnalytics.elementCountByUser(deepMaches)
  const testScore = elementCountsByUser.reduce( (acc, {userElementCount}) => {
    for ( const key in userElementCount ) {
      if ( typeof(userElementCount[key]) != 'number' ) { return acc + 1 }
    }
    return acc;
  }, 0)
  return testScore;
}

const test_avgElementsByCreator = (deepMaches) => {
  const avgElementsByCreator = macheAnalytics.avgElementsByCreator(deepMaches)
  if ( typeof avgElementsByCreator == 'number' ) {
    return true
  }
  return false;
}


const test_getClippingDist = (deepMaches) => {
  const clippingDists = macheAnalytics.getClippingDistribution(deepMaches)
  const testScore = clippingDists.reduce( (acc, {userElementCount}) => {
    for ( const key in userElementCount ) {
      if ( typeof(userElementCount[key]) != 'number' ) { return acc + 1 }
    }
    return acc;
  }, 0)
  return testScore
}

const test_elementsByCreator = (deepMaches) => {
  const elementsByCreator = macheAnalytics.elementsByCreator(deepMaches)
  const testScore = elementsByCreator.reduce( (acc, {elementsByCreator}) => {
    if ( typeof elementsByCreator != 'number' ) {  return acc + 1 }
    return acc;
  }, 0)

  return testScore

}
const testAll = () => {

}


const run = async() => {
  try {
    const maches = await helpers.getCollaboratedMaches([], 2)
    const t = test_getClippingDist(maches)
    console.log(t)
  } catch ( e ) {
    console.error(`Error testing macheAnalytics ${e}`)

  }
  process.exit(0)
  
}
