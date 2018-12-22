const config = require('config')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');
const { extractMaches, extractElements, extractClippings, macheAnalysis, avg, min, max, labUsers, ...helpers } = require('./helpers')

const macheAnalytics = {}

const getUserElementCount = (deepMache, includeLabUsers=false) => deepMache.elements.reduce( (acc, element) => {
  if ( !labUsers.includes(element.creator.toString() || includeLabUsers ) ) {
    acc.hasOwnProperty(element.creator) ? acc[element.creator.toString()]++ : acc[element.creator.toString()] = 1
    return acc
  } else {
    return acc
  }
}, {})




macheAnalytics.getClippingDistribution = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
  const macheClippings = deepMaches.map( m => { return { macheId : m._id, clippings : extractClippings(m) }  })
  console.log('MACHE CLIPPINGS', macheClippings )
  const clippingDist = macheClippings.map( ({macheId, clippings}) => {
    return clippings
    .map( c => c.toObject() )
    .reduce( (acc, c) => {
      if ( !acc.hasOwnProperty('macheId') ) { acc.macheId = macheId }
      if ( !acc.hasOwnProperty('clippingDist') ) { acc.clippingDist = {} }

      if ( acc['clippingDist'][c.type] ) {
        acc['clippingDist'][c.type] = acc['clippingDist'][c.type] + 1
      } else {
        acc['clippingDist'][c.type] = 1
      }
      return acc
    }, {})
  })
  return clippingDist;
}

macheAnalytics.avgElementsByCreator = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
  const elementByCreator = c => e => c.toString() === e.creator.toString()
  return deepMaches
  .map( m => {
    const creatorPred = elementByCreator(m.creator._id)
    const byCreator = m.elements.reduce( (acc, e) => acc + creatorPred(e), 0)
    if ( m.elements.length === 0 ) { return 0; }
    return byCreator / m.elements.length;
  })
  .reduce( (a,b) => a + b ) / deepMaches.length
}

macheAnalytics.elementsByCreator = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
  const elementByCreator = c => e => c.toString() === e.creator.toString()
  return deepMaches
  .map( m => {
    const creatorPred = elementByCreator(m.creator._id)
    const elByCreator = m.elements.reduce( (acc, e) => acc + creatorPred(e), 0)
    return { macheId : m._id, creatorId : m.creator._id, elementsByCreator : elByCreator, totalElements : m.elements.length }
  })
}

macheAnalytics.elementCountByUser = (deepMaches) => {
  if ( !Array.isArray(deepMaches) ) { deepMaches = [deepMaches] }
  return deepMaches.map( (m) => { return { userElementCount : getUserElementCount(m), totalElements : m.elements.length, totalUsers : m.users.length, macheId : m._id } })
}

module.exports = macheAnalytics;
