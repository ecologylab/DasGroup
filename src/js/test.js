import $ from 'jquery';
import helpers from './helpers/helpers.js';
import testGroupLifeCycle from './tests/testGroupLifeCycle.js';
import testFolioLifeCycle from './tests/testFolioLifeCycle.js';
import testRetry from './tests/testRetry.js';
const test = {};

const delay = (n) => {
  return new Promise( (resolve, reject) => {
    setTimeout( () => {
      resolve(true)
    }, n)
  })
}

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
    console.log("%cRunning tests!", "color : purple")
    testRetry()
    .then( s => {
      console.log("%cTest rety passed!", "color : green")
    })
    .catch( e => {
      console.log("%cTesting random failed: ", "color : red", e)
      reject(e);
    })
    testGroupLifeCycle.creation(userAndGroups)
    .then( group => testFolioLifeCycle(group) )
    //.then( _ => testGroupLifeCycle.deletion() )
    .then( _ => { console.log('%c Lifecycle tests passed!', ' color : green '); resolve(true); })
    .catch( e => {
      console.log("Testing model lifecycles failed: ", e)
      reject(e);
    })
  })
}





module.exports = test;
