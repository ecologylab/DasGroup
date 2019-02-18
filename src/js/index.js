import $ from 'jquery';
import helpers from './helpers/helpers.js';
import apiWrapper from './api/apiWrapper.js'
import groupViewHelper from './helpers/groupViewHelper.js'
const index = {};


let user = {},
    groups = {},
    components = [];

const createGroupForm = (el) => {
  console.log("in create group form")
  //let ren = groupViewHelper.renderCreateGroupForm('#formArea');
  window.location.href = '/newgroup';
}

const setHandlers = () => {
  $('#createNewGroup').on('click', createGroupForm)
  return true;
}


index.init = () => {
  const userId = $('#user').attr('data-userId');
  console.log("Index init: ", userId)
  return new Promise( (resolve, reject) => {
    helpers.getUserAndGroups(userId)
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
