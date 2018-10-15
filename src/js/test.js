import $ from 'jquery';
import helpers from './helpers/helpers.js';
import testGroupCreation from './tests/testGroupCreation.js';
import testFolioCreation from './tests/testFolioCreation.js';
const test = {};


let user = {},
    groups = {},
    components = [];

test.init = () => {
  const userId = $('h1').attr('data-userId');
  return new Promise( (resolve, reject) => {
    helpers.getUserAndGroups(userId)
    .then( userAndGroups => {
      user = userAndGroups.user;
      groups = userAndGroups.groups;
      resolve({user : user, groups : groups})
    })
    .catch( e => {
      console.error("Error in index init",e )
      reject(e);
    })
  })
}

test.tests = (userAndGroups) => {
  return new Promise( (resolve, reject) => {
    console.log("Running tests!")
    testGroupCreation(userAndGroups)
    .then( group => testFolioCreation(group) )
    .catch( e => {
      console.log("Testing failed: ", e)
      reject(e);
    })
  })
}





module.exports = test;
