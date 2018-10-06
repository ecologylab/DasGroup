import $ from 'jquery';
import logic from './logic.js';
import viewHelper from './groupViewHelper.js'
const groupLogic = {};
const components = [];


let user = {};
let group = {};
let state = {
      isAdmin : false
    }

const setState = () => {
  if ( group.roles.admins.includes(user._id) ) { state.isAdmin = true; }
  return true;
}

const renderPage = () => {
  if ( state.isAdmin ) {
    viewHelper.renderGetMembersButton('#buttonArea', group);
    let ren = viewHelper.renderCreateGroupForm('#buttonArea');
    console.log(ren)
  }
}

groupLogic.getState = () => {
  return state;
}




groupLogic.init = () => {
  const userId = $('#userId').attr('data-userId');
  const groupId = $('#groupId').attr('data-groupId');
  console.log("Group init: ", userId)
  return new Promise( (resolve, reject) => {
    logic.getUserAndGroups(userId, [groupId])
    .then( userAndGroup => {
      //setting base state
      user = userAndGroup.user;
      group = userAndGroup.groups[0];
      resolve(user);
    })
    .then( _ => setState() )
    .then( _ => renderPage() )
    .then( _ => { return { user : user, group : group } })
    .catch( e => {
      console.error("Error in group init",e )
      reject(e);
    })
  })
}




module.exports = groupLogic;
