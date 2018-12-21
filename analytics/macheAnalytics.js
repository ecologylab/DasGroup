const config = require('config')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');


const macheAnalytics = {}

macheAnalytics.getClippingDistribution = (deepMaches) => {

}

macheAnalytics.avgElementsByCreator = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
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

macheAnalytics.elementsByCreator = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
  const elementByCreator = c => e => c.toString() === e.creator.toString()
  return maches
  .map( m => {
    const creatorPred = elementByCreator(m.creator._id)
    const byCreator = m.elements.reduce( (acc, e) => acc + creatorPred(e), 0)
    if ( m.elements.length === 0 ) { return 0; }
    return byCreator
  })
  .reduce( (a,b) => a + b ) / maches.length
}

macheAnalytics.elementCountByUser = ( ) => {
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

module.exports = macheAnalytics;
