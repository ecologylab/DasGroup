process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');
const { getQuery } = require('../routing/helpers/getQuery')
const { extractMaches, extractElements, extractClippings, ...helpers } = require('./helpers')
const testAnalytics = require('./testAnalytics')
const analytics = {}

const macheAnalytics = require('./macheAnalytics')

//i take your collection and I extract from it the operandType
//ie if the type is mache and you pass groups I get maches from group
//operandType : mache, user... if it is user it would extract users from collection
//collection : collection of a single type

analytics.analytics = ( operandType, collection, applyingFnSet ) => {
  try {
    const operandTypes = ['mache', 'user', 'group']
    const collectionType = collection[0].constructor.modelName
    const applyMache = () => {
      const possibleFunctions = Object.keys(macheAnalytics)
      return applyingFnSet.map( functionName => {
        if ( !possibleFunctions.includes(functionName) ) { throw new Error(`applyMache does not know of function ${functionName}`) }
        return macheAnalytics[functionName](collection)
      })
    }
    if ( collectionType === 'Mache' ) {
      return applyMache()
    }

  } catch (e) {
    console.error(`Error in analytics main: ${e}`)
    return e;
  }

}
//right now just maches
analytics.runAnalytics = async( req, res ) => {
  const { operandType, locatorType, locators, applyingFnSet } = req.body;
  try {
    let collection = [];
    if ( locatorType.toLowerCase() === 'mache' ) {
      collection = await Mache.find( getQuery(locators) )
    }
    const results = analytics.analytics(operandType, collection, applyingFnSet)
    res.send(results)

  } catch (e) {
    console.error(e);
    res.status(412);
    res.send([])
  }
}



process.argv.forEach( async(val) => {
  if ( val.includes('solo') || val === '-s' ) {
    mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
      () => { console.log("Connected to database. Running analytics");  },
      err => { console.log("ERROR - Database connection failed")}
    )
    //run stuff
    const maches = await helpers.getCollaboratedMaches([], 2)
    const t = await main('mache', maches, ['elementCountByUser']);
  }
})



module.exports = analytics
