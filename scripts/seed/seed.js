//This uses the seed data which should have been populated from buildSeedData
const Account = require('../../models/account');
const Group = require('../../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); runSeed(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const runSeed = (emptyFirst) => {
  clearCollection(Account)
  .then ( () => clearCollection(Group) )
  .then( () => dropIndexes(Account) )
  .then( () => dropIndexes(Group) )
  .then( () => seed() )
  .then( () => { console.log('Seed success!'); process.exit(0); })
  .catch( (e) => console.error('Error in account seeding', e))
}
const clearCollection = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.deleteMany({}, err => {
      if ( err ) { console.error(err); }
      else { console.log("Collection cleared!"); resolve(true); }
    })
  })
}
const dropIndexes = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.collection.dropIndexes(err => {
      if ( err ) { console.error(err); }
      else { console.log("Dropped indexes!"); resolve(true); }
    })
  })
}
const seed = () => {
  return new Promise( (resolve, reject) => {
    jsonfile.readFile(seedFile)
    .then( (data) => {
      let accounts = data.accounts,
          groups = data.groups;
      let savePromises = [];
      accounts.forEach( (a) => {
        let newAcc = new Account(a);
        savePromises.push(newAcc.save() )
      })
      groups.forEach( (g) => {
        let newGroup = new Group(g);
        savePromises.push(newGroup.save() )
      })
      Promise.all( savePromises )
      .then( (saves) => resolve(true) )
      .catch( (err) => reject(err) )
    })
    .catch(err => reject(err))
  })

}
