process.env.NODE_ENV = 'dev'
const mongoose = require('mongoose')
const config = require('config')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');
const { extractMaches, extractElements, extractClippings, macheAnalysis, ...helpers } = require('./helpers')

// mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
//   () => { console.log("Connected to database. Running analytics");  },
//   err => { console.log("ERROR - Database connection failed")}
// )

const clippingAndElementPopulates = [
  { path : 'element' , populate : { path : 'clipping' } },
]
const testExtractClippings_folio = async () => {
  const folio = await Folio.findOne({ macheSubmissions : { $exists : true, $not : { $size : 0 } } }).exec()
  const folios = await Folio.find({ macheSubmissions : { $exists : true, $not : { $size : 0 } } }).limit(5).exec()
  const singleFolioMaches = await extractMaches(folio)
  const multipleFolioMaches = await extractMaches(folios)
  console.log("Should be lots of maches", singleFolioMaches.length, multipleFolioMaches.length)
}
const testExtractClippings_group = async () => {
  const group = await Group.findOne({ folios : { $exists : true, $not : { $size : 0 } } }).exec()
  const groups = await Group.find({ folios : { $exists : true, $not : { $size : 0 } } }).limit(5).exec()
  const singleGroupMaches = await extractMaches(group)
  const multipleGroupsMaches = await extractMaches(groups)
  console.log("Should be lots of maches", singleGroupMaches.length, multipleGroupsMaches.length)
}
const testExtractClippings_user = async () => {
  const user = await Account.findOne({ maches : { $exists : true, $not : { $size : 0 } } }).select('maches').exec()
  const users = await Account.find({ maches : { $exists : true, $not : { $size : 0 } } }).select('maches').limit(5).exec()
  const singleUserMaches = await extractMaches(user)
  const multipleUsersMaches = await extractMaches(users)
  console.log("Should be lots of maches", singleUserMaches.length, multipleUsersMaches.length)
}


const run_extractMachesTest = async () => {
  console.log('Testing Folio mache extraction')
  await testExtractClippings_folio()
  console.log('Testing groupId mache extraction!')
  await testExtractClippings_group()
  console.log('Testing user mache extraction!')
  await testExtractClippings_user()
}

const run_extractElements = async () => {
  const group = await Group.findOne({ folios : { $exists : true, $not : { $size : 0 } } }).exec()
  const maches = await extractMaches(group)
  const elements = await extractElements(maches)
  console.log( `Extracted ${elements.length} elements`, elements.length )
}

const run_extractClippings = async () => {
  const group = await Group.findOne({ folios : { $exists : true, $not : { $size : 0 } } }).exec()
  const maches = await extractMaches(group)
  const clippings = await extractClippings(maches)
  console.log( `Extracted ${clippings.length} clippings`, clippings.length )
}
const testMacheAnalysis = async () => {
  await testing_nonCurried()
  await testing_curried()
  console.log("Test mache analysis complete!")
  return true
}

const testing_nonCurried = async() => {
  const machesFromBigUsers = await helpers.getMachesFromUsersWithGtField('maches', 8)
  const machesFromLittleUsers = await helpers.getMachesFromUsersWithGtField('maches', 2, 5)
  const machePred_manyElements = (m) => m.elements.length > 50
  const machePred_fewElements = (m) => m.elements.length > 5

  const elementPredicate = (e) => e.clipping !== null;

  //Returns maches of big users that also have 50 or more elements
  const bigUsersManyElements = macheAnalysis(machesFromBigUsers, machePred_manyElements, -1, -1)
  console.log("bigUsersManyElements", bigUsersManyElements.length)

  const littleUsersManyElements = macheAnalysis(machesFromLittleUsers, machePred_manyElements, -1, -1)
  console.log("littleUsersManyElements", littleUsersManyElements.length)

  const bigUsersFewElements = macheAnalysis(machesFromBigUsers, machePred_fewElements, -1, -1)
  console.log("bigUsersFewElements", bigUsersFewElements.length)

  const littleUsersFewElements = macheAnalysis(machesFromLittleUsers, machePred_fewElements, -1, -1)
  console.log("littleUsersFewElements", littleUsersFewElements.length)

}
const testing_curried = async() => {
  const machesFromBigUsers = await helpers.getMachesFromUsersWithGtField('maches', 4)
  const machesFromLittleUsers = await helpers.getMachesFromUsersWithGtField('maches', 1, 3)
  const machePred_manyElements = (m) => m.elements.length > 10
  const machePred_fewElements = (m) => m.elements.length > 5
  const clippingPred_isImage = (c) => c.toObject().hasOwnProperty('type') && c.toObject().type === 'image_clipping'
  const clippingPred_isText = (c) => c.toObject().hasOwnProperty('type') && c.toObject().type === 'text_clipping'
  const clippingPred_selfMade = (c) => c.toObject().hasOwnProperty('type') && c.toObject().type === 'image_selfmade'
  const clippingPred_doesExist = (c) => c

  const elementPredicate = (e) => e.clipping !== null;

  const bigUsersManyElements_partial = macheAnalysis(machesFromBigUsers, machePred_manyElements)
  const littleUsersManyElements_partial = macheAnalysis(machesFromLittleUsers, machePred_manyElements)

  const bigUsers = {
    imageClippings : bigUsersManyElements_partial(elementPredicate, clippingPred_isImage).length,
    textClippings : bigUsersManyElements_partial(elementPredicate, clippingPred_isText).length,
    selfClippings :  bigUsersManyElements_partial(elementPredicate, clippingPred_selfMade).length,
    allClippings : bigUsersManyElements_partial(elementPredicate, clippingPred_doesExist).length
  }
  const littleUsers = {
    imageClippings : littleUsersManyElements_partial(elementPredicate, clippingPred_isImage).length,
    textClippings : littleUsersManyElements_partial(elementPredicate, clippingPred_isText).length,
    selfClippings :  littleUsersManyElements_partial(elementPredicate, clippingPred_selfMade).length,
    allClippings : littleUsersManyElements_partial(elementPredicate, clippingPred_doesExist).length
  }


  const slightyInterestingClippingStats = () => {
    bigUsers.imageToText = bigUsers.imageClippings / bigUsers.textClippings
    bigUsers.imageToSelf = bigUsers.imageClippings / bigUsers.selfClippings
    bigUsers.textToSelf = bigUsers.textClippings / bigUsers.selfClippings
    bigUsers.imageToAll = bigUsers.imageClippings / bigUsers.allClippings
    bigUsers.textToAll = bigUsers.textClippings / bigUsers.allClippings
    bigUsers.selfToAll = bigUsers.selfClippings / bigUsers.allClippings

    littleUsers.imageToText = littleUsers.imageClippings / littleUsers.textClippings
    littleUsers.imageToSelf = littleUsers.imageClippings / littleUsers.selfClippings
    littleUsers.textToSelf = littleUsers.textClippings / littleUsers.selfClippings
    littleUsers.imageToAll = littleUsers.imageClippings / littleUsers.allClippings
    littleUsers.textToAll = littleUsers.textClippings / littleUsers.allClippings
    littleUsers.selfToAll = littleUsers.selfClippings / littleUsers.allClippings
  }

  slightyInterestingClippingStats()

  console.log(bigUsers)
  console.log(littleUsers)



}
const testAll = async () => {
  await run_extractMachesTest()
  await run_extractElements();
  await run_extractClippings();
  await testMacheAnalysis();
  return true;
}




module.exports = {
  testMacheAnalysis : testMacheAnalysis,
  testExtractClippings_folio : testExtractClippings_folio,
  testExtractClippings_group : testExtractClippings_group,
  testExtractClippings_user : testExtractClippings_user,
  run_extractMachesTest : run_extractMachesTest,
  run_extractElements : run_extractElements,
  run_extractClippings : run_extractClippings,
  testAll : testAll,
}
