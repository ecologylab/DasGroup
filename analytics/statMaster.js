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
const moment = require('moment')
const { extractMaches, extractElements, extractClippings, macheAnalysis, avg, min, max, ...helpers } = require('./helpers')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database. Running analytics"); run()  },
  err => { console.log("ERROR - Database connection failed")}
)



const getClippingDistribution = async () => {
  const clippings = await Clipping.find({})
  const clippingDist = {}
  clippings
  .map( c => c.toObject() )
  .forEach( c => {
    clippingDist.hasOwnProperty(c.type) ? clippingDist[c.type]++ : clippingDist[c.type] = 1
  })

  Object.keys(clippingDist).forEach( distKey => {
    clippingDist[distKey] = { type : distKey, count : clippingDist[distKey], percentage : clippingDist[distKey] / clippings.length }
  })
  return clippingDist;
}

const macheProductionDensity = async () => {
  const daysOld = ( maches ) => maches.map( ({created_on}) => moment().diff(created_on, 'days') )
  const macheDensity = (q1) => q1.length / ( max(q1) - min(q1) )
  const maches = await Mache.find({}).select('created_on')
  let macheAges = daysOld(maches).sort( (a,b) => b - a)
  const quartileLength = ( macheAges.length - macheAges.length % 4 ) / 4
  const q1 = macheAges.splice(0, quartileLength)
  const q2 = macheAges.splice(0, quartileLength)
  const q3 = macheAges.splice(0, quartileLength)
  const q4 = macheAges.splice(0, quartileLength)

  const results = {
    q1 : { size : q1.length, density : macheDensity(q1), min : min(q1), max : max(q1) },
    q2 : { size : q2.length, density : macheDensity(q2),  min : min(q2), max : max(q2) },
    q3 : { size : q3.length, density : macheDensity(q3), min : min(q3), max : max(q3) },
    q4 : { size : q4.length, density : macheDensity(q4), min : min(q4), max : max(q4) },
  }
  return results
}


const collaborationMetrics = async() => {
  const results = {}
  const buildCollaborationMetrics = (maches) => {
    const avgCreatorElementProportions = () => {
      const elementByCreator = c => e => c.toString() === e.creator.toString()
      return maches
      .map( m => {
        const creatorPred = elementByCreator(m.creator._id)
        const byCreator = m.elements.reduce( (acc, e) => acc + creatorPred(e), 0)
        return byCreator / m.elements.length;
      })
      .reduce( (a,b) => a + b ) / maches.length
    }

    const elementCountByUser = (m) => {
      const userElementCount = m.elements.reduce( (acc, element) => {
        acc.hasOwnProperty(element.creator) ? acc[element.creator]++ : acc[element.creator] = 1
        return acc
      }, {})
      // m.users.forEach( u => {
      //   if ( !userElementCount.hasOwnProperty(u.user._id) ) {
      //     userElementCount[u.user._id] = 0
      //   }
      // })
      return userElementCount
    }

    const avgElementCreationByTopNPercentileUsers = (n=.25) => {
      return maches
      .map(elementCountByUser)

    }

    const averageElements = () => extractElements(maches).length / maches.length
    // console.log( avgElementCreationByTopNPercentileUsers() )

    return {
      avgProportionOfElementsByCreator : avgCreatorElementProportions(),
      avgElements : averageElements(),
      macheCount : maches.length,
      machesTested : maches.map( m => m._id )
    }

  }


  results.machesWith_2Users = buildCollaborationMetrics( await helpers.getCollaboratedMaches(1, 2) );

  results.machesWith_2to5Users = await buildCollaborationMetrics( await helpers.getCollaboratedMaches(2, 5) );

  results.machesWith_gt5Users = await buildCollaborationMetrics( await helpers.getCollaboratedMaches(5, 100) );

  return results;
}





const test = async () => {
  const maches = await Mache
  .find({ elements : { $exists : true, $not : { $size : 0 } } })
  .populate({ path : 'elements' , populate : { path : 'clipping' } })
  .limit(500).exec()
  const elements = extractClippings(maches);
  console.log(elements)

}



const run = async() => {
  // const clippingDistribution = await getClippingDistribution()
  // console.log(clippingDistribution)
  // await macheProductionDensity()

  console.log( await collaborationMetrics() )
  process.exit(0)
}
