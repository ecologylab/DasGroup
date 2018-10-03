import $ from 'jquery';
import logic from './logic.js';
import testRoutes from './tests/testRoutes.js'; //just for testing
const index = {};


let user = {},
    groups = {},
    components = [];

index.init = () => {
  const userId = $('h1').attr('data-userId');
  console.log("Index init: ", userId)
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



module.exports = index;
