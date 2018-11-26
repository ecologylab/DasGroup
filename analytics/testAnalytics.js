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
const { extractMaches, extractElements, extractClippings } = require('./analysisHelpers')

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

const testAll = async () => {
  await run_extractMachesTest()
  await run_extractElements();
  await run_extractClippings();
  return true;
}



module.exports = {
  testExtractClippings_folio : testExtractClippings_folio,
  testExtractClippings_group : testExtractClippings_group,
  testExtractClippings_user : testExtractClippings_user,
  run_extractMachesTest : run_extractMachesTest,
  run_extractElements : run_extractElements,
  run_extractClippings : run_extractClippings,
  testAll : testAll,
}
