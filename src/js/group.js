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




const _pre_collect = () => {
  const collection = {}
  const promises = []
  return new Promise( (resolve, reject) => {
    promises.push( apiWrapper.getUser('userId', state.userId) )
    promises.push( apiWrapper.getDeepGroup( { groupId : state.groupId} ) )
    Promise.all(promises)
    .then( ([user, group]) => {
      collection.user = user;
      collection.group = group;
      console.log("Collection", collection)
      resolve(collection);
    })
    .catch( e => {
      console.error("Error in _pre_collect ", e)
    })
  })
}



const _pre_initState = async () => {
  const collection = await _pre_collect('user','group')
  state.user = collection.user;
  if ( collection.user.memberOf.includes(state.groupId) ) { state.isMember = true; }
  if ( state.isMember === false && state.groupVisiblity === 'private' ) {
    window.location.href = '/';
  }
  state.group = collection.group;
  return true;
}

const _pre_setRenderChain = () => {
  if ( state.isMember === true ) {
    renderChain.push(renderPage);
  } else if (state.groupVisiblity !== 'private' ) {
    renderChain.push(renderInvite)
  }
  return true;
}

const _pre_setHandlers = () => {
  const setCardHandlers = () => {
    $('#folioCards').find('.card').toArray()
    .forEach( c => {
      $(c).on('click', function(el) {
        const folioId = $(this).attr('data-folio_id')
        const folio = state.group.folios.find( f => f._id == folioId )
        viewHelper.displayFolio(folio);
      })
    })
  }
  setCardHandlers();
}


groupLogic.init = async () => {
  try {
    await _pre_initState()
    _pre_setHandlers()
    _pre_setRenderChain()
    renderChain.forEach( renderTask => renderTask() )
    return { user : state.user, group : state.group }
  } catch (error) {
    console.error("error in groupLogic.init ", e)
  }

}




module.exports = groupLogic;
