//This connects to an instance of a recovered live mache db -> Account does exist in old live mache, not groups
//It then pulls 1/20th of the users
//It then adds this data to the seedFiles
//It then builds a group with the owner aaron and random members
const Account = require('../../models/account');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const seedFile = './scripts/seed/seedData.json'
const aaronsId = mongoose.Types.ObjectId();
const groupId = mongoose.Types.ObjectId();
const groupId2 = mongoose.Types.ObjectId();
const groupMembers = []; //populated during pull
const groupMembers2 = []; //populated during pull
require('dotenv').config()
mongoose.connect('mongodb://localhost/bpath', { useNewUrlParser : true }).then(
  () => { console.log("Connected. Beginning pull"); buildSeed(); },
  err => { console.log("ERROR - Database connection failed")}
)
const pullAccounts = () => {
  let accountData = [];
  return new Promise( (resolve, reject) => {
    Account.find({}, (err, docs) => {
      if (err) { reject(err); }
      docs.forEach( (d,i) => {
        if ( i % 20 === 0 ) {
          accountData.push(d);
          if ( i % 40 === 0 ) { groupMembers.push(d._id); }
          if ( i % 80 === 0 ) { groupMembers2.push(d._id); }
        }
      })
      resolve(accountData);
    })
  })
}
const createGroupSeedData = (memberIds) => {
  return [
      {
          "_id" : groupId,
          "creator" : aaronsId,
          "admins" : [aaronsId],
          "members" : groupMembers,
          "key" : 'abc',
          "name" : "##420Swag",
          "description" : 'But are we even real though'
        },
        {
            "_id" : groupId2,
            "creator" : aaronsId,
            "admins" : [aaronsId],
            "members" : groupMembers2,
            "key" : 'def',
            "name" : "BACON",
            "description" : 'Bad ass cronies only needin'
          }
      ]
}
const aaronsAccount = () => {
  return {
    "_id" : aaronsId,
    "username": "avsphere",
    "password": "xxx",
    "email": "avsp.here@tamu.edu",
    "salt": "xxx",
    "hash": "xxx",
    "bio": "living",
    "memberOf" : [],
    "adminOf" : [groupId, groupId2],
    "maches": ["5aa0a3e3d4d998961cb73292", "5abd471d0a1634b97fd952e7"]
  }
}
const writeToFile = (data, file) => {
  return new Promise( (resolve, reject) => {
    jsonfile.writeFile(file, data, (err) => {
      if (err) { reject(err); }
      else { resolve(true); }
    })
  })
}
const buildSeed = () => {
  return new Promise( (resolve, reject) => {
    let seedData = { accounts : [aaronsAccount()], groups : [] };
    pullAccounts()
    .then( (pulledAccounts) => {
      seedData.accounts = seedData.accounts.concat(pulledAccounts);
      return true;
    })
    .then( (s) => createGroupSeedData() )
    .then( (groupData) => { seedData.groups = seedData.groups.concat(groupData); return true;})
    .then( (s) => writeToFile(seedData, seedFile) )
    .then( (s) => { console.log('Finished: ', s); process.exit(0); })
    .catch( (e) => reject(e) )
  })

}
