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
const { extractMaches, extractElements, extractClippings, macheAnalysis, ...helpers } = require('./helpers')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database. Running analytics"); run()  },
  err => { console.log("ERROR - Database connection failed")}
)




const clippingDistribution = async () => {
  const maches = await Mache
  .find({ elements : { $exists : true, $not : { $size : 0 } } })
  .populate({ path : 'elements' , populate : { path : 'clipping' } })
  .limit(500).exec()
  const elements = extractClippings(maches);
  console.log(elements)

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
  const machesFromBigUsers = await helpers.getMachesFromUsersWithGtField('maches', 8)
  const machesFromLittleUsers = await helpers.getMachesFromUsersWithGtField('maches', 1, 2)
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


  const getBsButSlightlyInterestingStats = () => {
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

  getBsButSlightlyInterestingStats()

  console.log(bigUsers)
  console.log(littleUsers)



}

const run = async() => {
  await testing_curried()
  process.exit(0)
}
