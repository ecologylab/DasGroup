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
const jsonfile = require('jsonfile')
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
    if ( !labUsers.includes(element.creator.toString() ) ) {
      acc.hasOwnProperty(element.creator) ? acc[element.creator.toString()]++ : acc[element.creator.toString()] = 1
      return acc
    } else {
      return acc
    }
  }, {})
  for ( const userId in userElementCount) {
    userElementCount[userId] = { createdElements : userElementCount[userId],  createdPercentage : userElementCount[userId] / m.elements.length }
  }
  // userElementCount.nonParticaptingUsers = 0;
  // m.users.filter( u => u.user !== null && !labUsers.includes(u.user.username.toString() ) ).forEach( u => {
  //   if ( !userElementCount.hasOwnProperty(u.user._id) ) {
  //     userElementCount.nonParticaptingUsers++;
  //   } else {
  //     userElementCount[u.user._id.toString()] = { createdElements : userElementCount[u.user._id],  createdPercentage : userElementCount[u.user._id] / m.elements.length }
  //   }
  // })
  return { _id : m._id, totalElementCount : m.elements.length, userElementCount : userElementCount }
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
        if ( m.elements.length === 0 ) { return 0; }
        return byCreator / m.elements.length;
      })
      .reduce( (a,b) => a + b ) / maches.length
    }
    const averageElements = () => extractElements(maches).length / maches.length
    return {
      avgProportionOfElementsByCreator : avgCreatorElementProportions(),
      clippingDistribution : getClippingDistribution( extractClippings(maches) ),
      avgElements : averageElements(),
      macheCount : maches.length,
      elementCountByUser : maches.map( m => elementCountByUser(m) ).filter( elCount => Object.keys(elCount.userElementCount).length > 2 ).sort( (a,b) => b.totalElementCount - a.totalElementCount)
    }
  }
  results.collaboratedMaches = await buildCollaborationMetrics( await helpers.getCollaboratedMaches(maches, 1, 100) );

  return results;
}

const grabRelevantMaches = async () => {
  //this is using the keys from ajit. This script is not meant to be used in junction with anything else
  const grabMachesByHashKey = async() => {
    const keys = ["TPrjBusND9","LFXsS0pKh2","2RtjhOJQKu","EKa0n1muDC","wLkZc5QTMi","4gV1wYJeqE","nDNTH5jpFf","QFxb50HJeh","L97cdtUyCD","k7xyoKtEc1","4c1UYxTyRz","sjFhRxgJvd","UdD72Kh1O6","en8bPA1VWm","ObSWwemJz6","bdhQTfV7Lj","gYEe6LiPRk","0BK81EkI7w","Mf0pIdnkCP","YvmbGh68cq","QFxb50HJeh","EKa0n1muDC","NBEQqTLU9b","b4qOolwaPJ","P6qkzOTNF2","4cWwrFanHD","rm8BHndE3c","FoAf8C7itr","ObSWwemJz6","TdIli1Ek8K","RMC2yZz0F1","pEDNdMRwby","KkOa7FTg9j","huZ8SHBMLw","QFxb50HJeh","xMiyz83IcZ","5YgpQ1l8Nj","P6qkzOTNF2","4cWwrFanHD","EKa0n1muDC","IE3HeGwKi2","lpBwFqPWZI","EKa0n1muDC","ObSWwemJz6","jdrnvKQXIE","en0QASVics","hXjTMQGLEa","WTEfc7oHu1","YvmbGh68cq","lgpUE7ZNRC","QFxb50HJeh","KiI98Pzwk1","ky63t57mIe","SvcXtxd8Ls","RFr5xY9OWE","DuqQTWxlVJ","F8UAuLJSKD","aj2WBKmQCz","1gsVrp6i93","fNYPD90i8p","q1SZyCx8zO","YvmbGh68cq","QFxb50HJeh","2gOX0rHczi","ky63t57mIe","SvcXtxd8Ls","Kr09Jg8Xo6","KWbv9TrxCl","Kr09Jg8Xo6","sl9O6wQUy0","sO5TjZYRaq","m7VazBqO6K","X3mREA4HNc","YvmbGh68cq","SvcXtxd8Ls","2gOX0rHczi","TZkxgtLrjY","rGA7Z0gSdi","8wKyBVQcE0","Apoiflweja","sl9O6wQUy0","DfPA5Rz0BN","Yo1SLQIN0U","YvmbGh68cq","SvcXtxd8Ls","2gOX0rHczi","OM14bH8DrB","TZkxgtLrjY","HcO4YRCar1","8wKyBVQcE0","m7VazBqO6K"]
    const keyMaches = await Mache.find({ hash_key : { $in : keys } })
    .populate('creator')
    .populate('users.user')
    .populate({ path : 'elements' , populate : { path : 'clipping' } })
    .exec()
    return keyMaches
  }
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
  const filterOutManuallySub = (manuallySubmittedMaches, otherMaches) => {
    const allMaches = manuallySubmittedMaches.concat(otherMaches)
    const uniqueMacheIds = new Set( allMaches.map( m => m._id.toString() ) )
    const uniqueMaches = Array.from(uniqueMacheIds).map( id => allMaches.find( m => m._id.toString() === id.toString() ) )
    return uniqueMaches
  }
  const daysOld = ({created_on}) => moment("20181203", "YYYYMMDD").diff(created_on, 'days')
  const fall2018_315Group = await Group.findById("5bbe9087bcf3327de217de09").populate('members').exec()
  const manuallySubmittedMaches = await grabMachesByHashKey();

  const membersMaches = await extractMaches(fall2018_315Group.members)
  const studentMaches = filterOutLabMaches(membersMaches);
  const machesInDateRange = studentMaches.filter( m => daysOld(m) < 90)
  const allRelevantMaches = filterOutManuallySub(manuallySubmittedMaches, machesInDateRange).filter( m => m.elements.length > 10 )

  return allRelevantMaches
}

const grabCollabMaches = async () => {
  //this is using the keys from ajit. This script is not meant to be used in junction with anything else

  const filterOutLabMaches = (maches) => {
    const userIsNotNull = (m) => {
      let pass = true
      m.users.forEach( u => {
        if ( u.user === null || u.user === undefined ) { pass = false }
      })
      return pass
    }
    const creatorNotLabUser = (m) => !labUsers.includes(m.creator.username.toString()) && m.creator.access_code !== "ecologyfriends"
    const containsStudentUsers = (m) => {
      const labUserCount = m.users.filter( u => labUsers.includes( u.user.username.toString() ) ).length
      return m.users.length - labUserCount
    }
    return maches.filter( m => userIsNotNull(m) && creatorNotLabUser(m) )
  }

  const daysOld = ({created_on}) => moment("20181203", "YYYYMMDD").diff(created_on, 'days')
  const collabMaches = await helpers.getCollaboratedMaches([], 2, 100)
  const maches = filterOutLabMaches(collabMaches);
  const machesInDateRange = maches.filter( m => daysOld(m) > 90 && daysOld(m) < 450 )

  return machesInDateRange
}





const run = async() => {
  // const classMaches = await grabRelevantMaches()
  const collabMaches = await grabCollabMaches()
  // const classMetrics = await computeClassMetrics(classMaches)
  const collabMetrics = await computeClassMetrics(collabMaches)
  // console.log( JSON.stringify(classMetrics, null, 2) )
  // await jsonfile.writeFile('./analytics/classAnalytics.json', classMetrics)
  await jsonfile.writeFile('./analytics/collabAnalytics.json', collabMetrics)

  process.exit(0)
}
