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

const labUsers = [
  "bill.hamilton","nicolas.botello.jr.","nic", "brieyh'leai.reyhn.simmons", "billingsley", "ajit.jain0", "rhema.linder",
  "ecologylab", "nic_endsDemo", "ajit.jain", "alexandria.stacy", "nicTest3", "hannah.jo.fowler", "ajit.courses", "andruid.courses"
]

const getClippingDistribution = (clippings) => {
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

const getMacheProductionDensity = (maches) => {
  const daysOld = () => maches.map( ({created_on}) => moment().diff(created_on, 'days') )
  const macheDensity = (q1) => q1.length / ( max(q1) - min(q1) )
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


const elementCountByUser = (m) => {
  const userElementCount = m.elements.reduce( (acc, element) => {
    acc.hasOwnProperty(element.creator) ? acc[element.creator].createdElements++ : acc[element.creator].createdElements = 1
    return acc
  }, {})
  m.users.forEach( u => {
    if ( !userElementCount.hasOwnProperty(u.user._id) && !labUsers.includes(u.user.username.toString() ) ) {
      userElementCount[u.user._id].createdElements = 0
      userElementCount[u.user._id].createdPercentage = 0
    } else {
      userElementCount[u.user._id].createdPercentage = userElementCount[u.user._id].createdElements / m.elements.length
    }
  })
  return userElementCount
}


const computeClassMetrics = async(maches) => {
  console.log("Length of collaboration", maches.length)
  const results = {}
  const buildCollaborationMetrics = () => {
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
    const averageElements = () => extractElements(maches).length / maches.length
    return {
      avgProportionOfElementsByCreator : avgCreatorElementProportions(),
      clippingDistribution : getClippingDistribution( extractClippings(maches) ),
      macheProductionDensity : getMacheProductionDensity(maches),
      avgElements : averageElements(),
      macheCount : maches.length,
      machesTested : maches.map( m => m._id )
    }
  }
  results.collaboratedMaches = await buildCollaborationMetrics( await helpers.getCollaboratedMaches(maches, 1, 100) );

  return results;
}

const grabRelevantMaches = async () => {
  const filterOutLabMaches = (maches) => {
    const userIsNotNull = (m) => {
      let pass = true
      m.users.forEach( u => {
        if ( u.user === null || u.user === undefined ) { pass = false }
      })
      return pass
    }
    const creatorNotLabUser = (m) => !labUsers.includes(m.creator.username.toString()) && m.creator.access_code.length > 10 && m.creator.access_code !== "ecologyfriends"
    const containsStudentUsers = (m) => {
      const labUserCount = m.users.filter( u => labUsers.includes( u.user.username.toString() ) ).length
      return m.users.length - labUserCount
    }
    return maches.filter( m => userIsNotNull(m) && creatorNotLabUser(m) )
  }
  const daysOld = ({created_on}) => moment("20181203", "YYYYMMDD").diff(created_on, 'days')
  const fall2018_315Group = await Group.findById("5bbe9087bcf3327de217de09").populate('members').exec()
  const membersMaches = await extractMaches(fall2018_315Group.members)
  const studentMaches = filterOutLabMaches(membersMaches);
  const machesInDateRange = studentMaches.filter( m => daysOld(m) < 90)
  return machesInDateRange
}





const run = async() => {
  const maches = await grabRelevantMaches()
  const classMetrics = await computeClassMetrics(maches)
  console.log(classMetrics)
}
