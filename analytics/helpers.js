process.env.NODE_ENV = 'dev'
const config = require('config')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');

//From Eric Elliots "Composing Software"
const curry = (f, arr = []) => (...args) => ( a => a.length === f.length ? f(...a) : curry(f, a) )([...arr, ...args])
const uniq = (a) => Array.from(new Set(a));
const getDeepMaches = (macheIds) => Mache.find({ _id : { $in : macheIds } }).populate({ path : 'elements' , populate : { path : 'clipping' } }).exec()

const extractElements = (maches) => {
  if ( !Array.isArray(maches) ) { maches = [maches] }
  if ( maches.length === 0 ) { return [] }
  const elements = maches.map( mache => mache.elements).reduce( (a,b) => a.concat(b) )
  return elements
}

//Fix seed
const extractClippings = (maches) => {
  if ( !Array.isArray(maches) ) { maches = [maches] }
  if ( maches.length === 0 ) { return [] }
  // let clippingIds = maches.map( mache => mache.elements.map( element => element.clipping ) ).reduce( (a,b) => a.concat(b) ).filter( clipping => clipping !== null ).map( c => c._id )
  // return Clipping.find({ _id : { $in : clippingIds } }).exec()
  return maches.map( mache => mache.elements.map( element => element.clipping ) ).reduce( (a,b) => a.concat(b) ).filter( clipping => clipping !== null )
}

const extractMaches = async (collection, options) => {
  if ( !Array.isArray(collection) ) { collection = [collection] }
  const modelName = collection[0].constructor.modelName;
  let maches = []

  const extractMaches_folio = (folios) => {
    if ( !folios ) { folios = collection }
    const macheIds = folios.map( (folio) => folio.macheSubmissions.map( sub => sub.mache.toString() ) ).reduce( (a, b) => a.concat(b) )
    if ( macheIds.length === 0 ) { return [] }
    return getDeepMaches(macheIds)
  }
  const extractMaches_group = async () => {
    const folioIds = collection.map( (group) => group.folios ).reduce( (a, b) => a.concat(b) )
    const folios = await Folio.find({ _id : { $in : folioIds },  macheSubmissions : { $exists : true, $not : { $size : 0 } }  }).select('macheSubmissions').exec()
    if ( folios.length === 0 ) { return [] }
    return extractMaches_folio(folios);
  }
  const extractMaches_user = async () => {
    const macheIds = collection.map( (user) => user.maches ).reduce( (a, b) => a.concat(b) )
    return getDeepMaches(macheIds)
  }

  if ( modelName === 'Folio' ) {
    maches = await extractMaches_folio()
  } else if ( modelName === 'Group' ) {
    maches = await extractMaches_group()
  } else if ( modelName === 'Account') {
    maches = await extractMaches_user();
  } else {
    console.log(`Model ${modelName} is not supported`)
  }
  return maches;
}


const getMachesFromUsersWithGtField = async(field='maches', n=8, max=1000 ) => {
  const query = {}
  query[`${field}.${n}`] = { $exists : true }
  const users = await Account.find(query)
  const macheIds = users
  .filter( ({maches}) => maches.length <= max)
  .map( ({maches}) => maches )
  .reduce( (a,b) => a.concat(b) )
  return getDeepMaches(macheIds)
}




//the resultings maches from macheCollector must be at the depth at which you wish to filter
//This function can be curried to desire use by passing null args, therefore the return value is dependent on args
const macheAnalysis = curry(  (maches, machePredicate, elementPredicate, clippingPredicate) => {
  if ( machePredicate === -1 ) { return maches; }

  const filteredMaches = maches.filter( machePredicate )
  if ( elementPredicate === -1 ) { return filteredMaches; }

  const filteredElements = extractElements(filteredMaches).filter( elementPredicate )
  if ( clippingPredicate === -1 ) { return filteredElements; }

  const filteredClippings = filteredElements.map( ({clipping}) => clipping ).filter(clippingPredicate)
  return filteredClippings
})

module.exports = {
  macheAnalysis : macheAnalysis,
  getMachesFromUsersWithGtField : getMachesFromUsersWithGtField,
  getDeepMaches : getDeepMaches,
  extractMaches : extractMaches,
  extractElements : extractElements,
  extractClippings : extractClippings
}
