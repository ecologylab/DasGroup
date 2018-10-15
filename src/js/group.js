import $ from 'jquery';
import helpers from './helpers/helpers.js';
import apiWrapper from './api/apiWrapper.js'
import viewHelper from './helpers/groupViewHelper.js'
const groupLogic = {};
const components = [];

const state = {
      userId : $('#user').attr('data-userId'),
      groupId : $('#group').attr('data-groupId'),
      groupVisiblity : $('#group').attr('data-groupVisibility'),
      user : {},
      group : {},
      isAdmin : false,
      isMember : false
    }
const renderChain = []

const renderAdmin = () => {
  if ( state.isAdmin ) {
    viewHelper.renderGetMembersButton('#buttonArea', state.group);
    let currComponents = viewHelper.renderCreateFolio('#buttonArea', state.group);
    console.log("curr components ", currComponents)
  }
}

const renderPage = () => {
  console.log("rendering page!");
}

const renderInvite = () => {
  $('.wrapper').empty();
  const buildAndAppendModal = () => {
    let html = `<div class="modal fade" id="joinGroupModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Join Group: ${state.group.name}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                You are currently not part of ${state.group.name}. Click join to join!
              </div>
              <div class="modal-footer">
                <button id='modal_acceptInvite' type="button" class="btn btn-primary">Join</button>
                <button id='modal_declineInvite' type="button" class="btn btn-secondary" data-dismiss="modal">No Way</button>
              </div>
            </div>
          </div>
        </div>`
    $('.wrapper').append(html)
  }
  buildAndAppendModal()
  $('#modal_declineInvite').on('click', () => { window.location.href = '/' })
  $('#modal_acceptInvite').on('click', () => {
    apiWrapper.joinGroup({groupId : state.groupId })
    .then( s => {
      window.location.href = `/?joined=${state.group.name}`;
    })
    .catch(e => console.error("Error accepting group invite", e))
  })
  $('#joinGroupModal').modal({})
  console.log("rendering invite!")
}

groupLogic.getState = () => {
  return state;
}




const _pre_initState = () => {
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', state.userId)
    .then( u => {
      console.log(state);
      state.user = u;
      if ( u.memberOf.includes(state.groupId) ) { state.isMember = true; }
      if ( state.isMember === false && state.groupVisiblity === 'private' ) {
        window.location.href = '/';
      }
      return apiWrapper.getGroups('groupId', state.groupId);
    })
    .then( group => {
      group = group[0]
      console.log(group)
      state.group = group;
      if ( group.roles.admins.includes(state.userId) ) {
        state.isAdmin = true;
      }
      resolve(true);
    })
    .catch( e => console.error('Error in _pre_initState ', e))
  })
}

const _pre_setRenderChain = () => {
  if ( state.isMember === true ) {
    renderChain.push(renderPage);
    if ( state.isAdmin === true ) { renderChain.push(renderAdmin); }
  } else if (state.groupVisiblity !== 'private' ) {
    renderChain.push(renderInvite)
  }
  return true;
}


groupLogic.init = () => {
  return new Promise( (resolve, reject) => {
    _pre_initState()
    .then( s => {
      return _pre_setRenderChain()
    })
    .then( s => {
      console.log("render chain " , renderChain)
      renderChain.forEach( renderFunc => renderFunc() )
    })
    .then( _ => { return { user : state.user, group : state.group } })
    .catch( e => {
      console.error("Error in group init",e )
      reject(e);
    })
  })
}




module.exports = groupLogic;
