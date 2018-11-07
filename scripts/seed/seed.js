process.env.NODE_ENV = 'dev'
//This uses the seed data which should have been populated from buildSeedData
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Folio = require('../../models/folio');
const Role = require('../../models/role');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const config = require('config')
const seedFolios = require('./folioSeed')
const seedFile = './scripts/seed/seedData.json';

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); runSeed(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const runSeed = (emptyFirst) => {
  clearCollection(Account)
  .then ( () => clearCollection(Group) )
  .then ( () => clearCollection(Mache) )
  .then ( () => clearCollection(Folio) )
  .then ( () => clearCollection(Role) )
  .then( () => dropIndexes(Account) )
  .then( () => dropIndexes(Group) )
  .then( () => dropIndexes(Mache) )
  .then( () => seed() )
  .then( () => setAaronsMaches() )
  .then( () => { console.log('Seed success!'); process.exit(0); })
  .catch( (e) => console.error('Error in seeding', e))
}
//This is using the dev user set in the config
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
const seed = () => {
  return new Promise( (resolve, reject) => {
    jsonfile.readFile(seedFile)
    .then( (data) => {
      let accounts = data.accounts,
          groups = data.groups,
          maches = data.maches;
      let savePromises = [];
      accounts.forEach( (a) => {
        let newAcc = new Account(a);
        savePromises.push(newAcc.save() )
      })
      groups.forEach( (g) => {
        let newGroup = new Group(g);
        savePromises.push(newGroup.save() )
      })
      maches.forEach( (m) => {
        if ( !m.hasOwnProperty('description') ) { console.log(m); m.description = ''; }
        m.description = m.description + ' ';
        let newMache = new Mache(m);
        savePromises.push(newMache.save() )
      })

      Promise.all( savePromises )
      .then( async (saves) => {
        await seedFolios()
        resolve(true);
      })
      .catch( (err) => reject(err) )
    })
    .catch(err => reject(err))
  })

}
