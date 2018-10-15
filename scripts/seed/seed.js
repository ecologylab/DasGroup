process.env.NODE_ENV = 'dev'
//This uses the seed data which should have been populated from buildSeedData
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Bucket = require('../../models/group');
const Role = require('../../models/role');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const config = require('config')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); runSeed(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const runSeed = (emptyFirst) => {
  clearCollection(Account)
  .then ( () => clearCollection(Group) )
  .then ( () => clearCollection(Mache) )
  .then ( () => clearCollection(Bucket) )
  .then ( () => clearCollection(Role) )
  .then( () => dropIndexes(Account) )
  .then( () => dropIndexes(Group) )
  .then( () => dropIndexes(Mache) )
  .then( () => seed() )
  .then( () => { console.log('Seed success!'); process.exit(0); })
  .catch( (e) => console.error('Error in seeding', e))
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
      .then( (saves) => resolve(true) )
      .catch( (err) => reject(err) )
    })
    .catch(err => reject(err))
  })

}
