import $ from 'jquery';
import logic from './logic.js';
import apiWrapper from './apiWrapper.js'; //just for testing
const index = {};


let user = {},
    groups = {},
    components = [];

index.init = () => {
  const userId = $('h1').attr('data-userId');
  return new Promise( (resolve, reject) => {
    logic.getUserAndGroups(userId)
    .then( userAndGroups => {
      user = userAndGroups.user;
      groups = userAndGroups.groups;
      resolve(true)
    })
    .catch( e => {
      console.error("Error in index init",e )
      reject(e);
    })
  })
}

index.tests = () => {
  return new Promise( (resolve, reject) => {
    console.log(user, groups, apiWrapper)
    resolve(true);
  })
}





module.exports = index;
