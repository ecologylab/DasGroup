//FIX ME


process.env.NODE_ENV = 'dev'
//This uses the seed data which should have been populated from buildSeedData
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Folio = require('../../models/group');
const Role = require('../../models/role');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const config = require('config')

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
const shotgun = async () => {
  const user = await Account.findOne( { username : config.developmentUsername } ).populate('memberOf').exec()
  const saves = user.memberOf.map( g => {
    const groupLocator = { groupKey : g.key }
    testLogic.addMacheToFolioShotgun(groupLocator);
  })
  Promise.all(saves)
  .then(_ => {
    console.log("Shotgun success")
    return 0;
  })
  .catch( e => console.error("Failed shotgun", e) )
}

module.exports = shotgun;
