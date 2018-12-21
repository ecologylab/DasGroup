process.env.NODE_ENV = 'dev'
//This uses the seed data which should have been populated from buildSeedData
//This is just for seeding a sample sized db with lots of folios and groups for easier testing
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Folio = require('../../models/folio');
const Clipping = require('../../models/clipping');
const Element = require('../../models/element');
const Role = require('../../models/role');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const config = require('config')
const seedFolios = require('./folioSeed')
const seedFile = './scripts/seed/seedData/seedData.json';

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); runSeed(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const runSeed = async () => {
    await clearCollection(Account)
    await clearCollection(Mache)
    await clearCollection(Folio)
    await clearCollection(Role)
    await clearCollection(Clipping)
    await clearCollection(Element)
    await clearCollection(Group)
    await dropIndexes(Account)
    await dropIndexes(Group)
    await dropIndexes(Mache)

    await seed()
    // await seedFolios() //creation of folios for dev user
    console.log('Seed success!');
    process.exit(0);
}



const setAaronsMaches = () => {
  let devUserId = ''
  const findMache = (macheId) => Mache.findById(macheId).exec()
  return new Promise( (resolve, reject) => {
    Account.findOne({ username : config.developmentUsername }).exec()
    .then( devUser => {
      devUserId = devUser._id;
      return Promise.all( devUser.maches.map( macheId => findMache(macheId)) )
    })
    .then( maches => {
      return Promise.all(maches.map( m => {
        m.creator = devUserId
        return m.save();
      }) )
    })
    .then( updatedMaches => resolve(true) )
    .catch( e => console.error('Something went wrong in setAaronsMaches', e) )
  })
}
const clearCollection = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.deleteMany({}, err => {
      if ( err ) { console.error(err); }
      else { console.log(Model.modelName, "Collection cleared!"); resolve(true); }
    })
  })
}
const dropIndexes = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.collection.dropIndexes(err => {
      if ( err ) { console.error(err); }
      else { console.log(Model.modelName, "Dropped indexes!"); resolve(true); }
    })
  })
}

const seed = async () => {
  try {
    const { accounts, groups, maches, elements, clippings, roles, folios } = await jsonfile.readFile(seedFile);
    const savePromises = []
    await Account.insertMany(accounts)
    console.log("Accounts seeded")
    await Role.insertMany(roles)
    console.log("Roles seeded")
    await Mache.insertMany(maches)
    console.log("Maches seeded")
    await Group.insertMany(groups)
    console.log("Groups seeded")
    await Folio.insertMany(folios)
    console.log("Folios seeded")
    await Clipping.insertMany(clippings)
    console.log("Clippings seeded")
    await Element.insertMany(elements)
    console.log("Elements seeded")
    return true
  }
  catch ( e ) {
    console.error("Error!", e)
    return e
  }
}
