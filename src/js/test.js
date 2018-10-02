import $ from 'jquery';
import logic from './logic.js';
import testRoutes from './tests/testRoutes.js'; //just for testing
const test = {};


let user = {},
    groups = {},
    components = [];

test.init = () => {
  const userId = $('h1').attr('data-userId');
  return new Promise( (resolve, reject) => {
    logic.getUserAndGroups(userId)
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
    testRoutes(userAndGroups)
    .then( s => {
      resolve(s);
    })
    .catch( e => {
      console.log("Testing failed: ", e)
      reject(e);
    })
  })
}





module.exports = test;
