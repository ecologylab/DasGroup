//This connects to an instance of a recovered live mache db -> Account does exist in old live mache, not groups
//It then pulls 1/20th of the users
//It then adds this data to the seedFiles
//It then builds a group with the owner aaron and random members
const Account = require('../../models/account');
const Mache = require('../../models/mache');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const seedFile = './scripts/seed/seedData.json'
const aaronsId = mongoose.Types.ObjectId();
const group1Id = mongoose.Types.ObjectId();
const group2Id = mongoose.Types.ObjectId();
const group3Id = mongoose.Types.ObjectId();
let randomMember = '';
const group1Members = []; //populated during pull
const group2Members = []; //populated during pull
let aaronsMaches = [] //randomly selected maches that are not part of the sampled users
let machesReferenced = [];
//A local restored live mache backup
mongoose.connect('mongodb://localhost/bpath', { useNewUrlParser : true }).then(
  () => { console.log("Connected. Beginning pull"); buildSeed(); },
  err => { console.log("ERROR - Database connection failed")}
)
const pullAccounts = () => {
  let accountData = [];
  return new Promise( (resolve, reject) => {
    Account.find({}, (err, docs) => {:
      if (err) { reject(err); }
      docs.forEach( (d,i) => {
        if ( i % 80 === 0 ) {
          machesReferenced = machesReferenced.concat(d.maches)
          accountData.push(d);
        } else if ( i % 60 === 0 ) {
          machesReferenced = machesReferenced.concat(d.maches)
          d.memberOf = [group1Id];
          group1Members.push(d._id);
          accountData.push(d);
        } else if ( i % 20 === 0 ) {
          accountData.push(d);
          machesReferenced = machesReferenced.concat(d.maches)
          d.memberOf = [group2Id];
          group2Members.push(d._id);
        } else if ( aaronsMaches.length < 8 && d.maches.length > 1 ) {
          let m = d.maches[0];
          machesReferenced.push(m);
          aaronsMaches.push(m)
        }
      })
      randomMember = accountData[group2Members.length-1];
      machesReferenced = machesReferenced.concat(aaronsMaches)
      randomMember.memberOf = randomMember.memberOf.concat([group3Id])
      group1Members.push(aaronsId)
      group2Members.push(aaronsId)
      resolve(accountData);
    })
  })
}
const seedMaches = () => {
  return new Promise( (resolve, reject) => {
    Mache.find({ _id : { $in : machesReferenced } }, (err, maches) => {
      if ( err ) { reject(err); }
      resolve(maches);
    })
  })
}
const createGroupSeedData = (memberIds) => {
  return [
      {
          "_id" : group1Id,
          "creator" : aaronsId,
          "roles.admins" : [aaronsId],
          "members" : group1Members,
          "key" : 'abc',
          "name" : "##420Swag",
          "description" : 'But are we even real though'
        },
        {
            "_id" : group2Id,
            "creator" : aaronsId,
            "roles.admins" : [aaronsId],
            "members" : group2Members,
            "key" : 'def',
            "name" : "MemeMasters",
            "description" : 'lol'
          },
          {
              "_id" : group3Id,
              "creator" : randomMember,
              "roles.admins" : [randomMember],
              "members" : [randomMember],
              "key" : 'efg',
              "name" : 'Not Aarons Group',
              "description" : 'Defintely not Aarons'
            }
      ]
}
const aaronsAccount = () => {
  // console.log("Creating aarons account with the following maches", aaronsMaches)
  return {
    "_id" : aaronsId,
    "username": "avsphere",
    "password": "xxx",
    "email": "avsp.here@tamu.edu",
    "salt": "xxx",
    "hash": "xxx",
    "bio": "living",
    "memberOf" : [group1Id, group2Id],
    "maches": aaronsMaches
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
    let seedData = { accounts : [], groups : [], maches : [] };
    pullAccounts()
    .then( (pulledAccounts) => {
      seedData.accounts = seedData.accounts.concat(pulledAccounts);
      seedData.accounts.push(aaronsAccount())
      return true;
    })
    .then( (s) => createGroupSeedData() )
    .then( (groupData) => { seedData.groups = seedData.groups.concat(groupData); return seedMaches();})
    .then( macheData => { seedData.maches = seedData.maches.concat(macheData); return true; })
    .then( (s) => writeToFile(seedData, seedFile) )
    .then( (s) => { console.log('Finished: ', s); process.exit(0); })
    .catch( (e) => reject(e) )
  })

}
