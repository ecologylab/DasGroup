const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); runTests(); },
  err => { console.log("ERROR - Database connection failed")}
)




const getGroupMembers = () => {
  return new Promise( (resolve, reject) => {
    Group.findOne({ key : 'abc' })
    .exec()
    .then( (group) => group.getGroupMembers(Account) )
    .then( members => resolve(members) )
    .catch( (e) =>  logger.test('Error - getGroupMembers %O', e.message) )
  })
}

const getGroups = () => {
  return new Promise( (resolve, reject) => {
    Account.findOne({ username : 'avsphere' })
    .exec()
    .then( (user) => user.getGroups() )
    .then( groups => resolve(groups) )
    .catch( (e) =>  logger.test('Error - getGroups %O', e.message) )
  })
}

const getAdminOf = () => {
  return new Promise( (resolve, reject) => {
    Account.findOne({ username : 'avsphere' })
    .exec()
    .then( (user) => user.getAdminOf() )
    .then( adminGroups => resolve(adminGroups) )
    .catch( (e) =>  logger.test('Error - getGroups %O', e.message) )
  })
}

const runTests = () => {
  getGroupMembers()
  .then( members => logger.test("getGroupMembers - should be a number != 0 %O", members.length) )
  .then( _ => getGroups() )
  .then( groups => logger.test("getGroups - should be a number != 0 %O", groups.length) )
  .then( _ => getAdminOf() )
  .then( adminOfGroups => logger.test("getAdminOf - should be a number != 0 %O", adminOfGroups.length))
}
