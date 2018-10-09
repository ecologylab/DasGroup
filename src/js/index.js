import $ from 'jquery';
import logic from './logic.js';
import viewHelper from './groupViewHelper.js'
const index = {};


let user = {},
    groups = {},
    components = [];

const createGroupForm = (el) => {
  console.log("in render form")
  let ren = viewHelper.renderCreateGroupForm('#formArea');
}

const setHandlers = () => {
  $('#createNewGroup').on('click', createGroupForm)
  return true;
}


index.init = () => {
  const userId = $('#user').attr('data-userId');
  console.log("Index init: ", userId)
  return new Promise( (resolve, reject) => {
    logic.getUserAndGroups(userId)
    .then( userAndGroups => {
      user = userAndGroups.user;
      groups = userAndGroups.groups;
      return true;
    })
    .then( _ => setHandlers() )
    .then( s => resolve(s) )
    .catch( e => {
      console.error("Error in index init",e )
      reject(e);
    })
  })
}





module.exports = index;
