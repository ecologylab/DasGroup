import $ from 'jquery';
import helpers from './helpers/helpers.js';
import apiWrapper from './api/apiWrapper.js'
import viewHelper from './helpers/groupViewHelper.js'
const uniq = (a) => Array.from(new Set(a));
const adminLogic = {};
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
  //do stuff
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






const _pre_collect = () => {
  const collection = {}
  const promises = []
  return new Promise( (resolve, reject) => {
    const populates = [
      { path : 'members', select : '-hash -salt'},
      { path : 'folios' , populate : { path : 'macheSubmissions.mache' } }
    ]
    promises.push( apiWrapper.getUser('userId', state.userId) )
    promises.push( apiWrapper.getGroupAndPopulate({ groupQuery : { groupId : state.groupId}, populates : populates }) )
    Promise.all(promises)
    .then( ([user, group]) => {
      collection.user = user;
      collection.group = group;
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
  if ( collection.group.roles.admins.includes(state.userId) ) {
    state.isAdmin = true;
  }
  return true;
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

//obviously this is just for a proof of concept
const displayFolio = (folio) => {
  const folioName = $('#folioName');
  const folioDescription = $('#folioDescription');
  const folioState = $('#folioState');
  const folioVisibility = $('#folioVisibility');
  const folioSubmissions = $('#folioSubmissions');
  const folioNotYetSubmitted = $('#folioNotYetSubmitted');

  folioName.text(`Name : ${folio.name}`);
  folioDescription.text(`Description : ${folio.description}`);
  folioState.text(`State : ${folio.state}`);
  folioVisibility.text(`Visiblity : ${folio.visibility}`);

  folio.macheSubmissions.forEach( ({ mache }) => {
    let html = `<li class="list-group-item"> <a href="https://livestaging.ecologylab.net/e/${mache.hash_key}">${mache.title}</a></li>`
    folioSubmissions.append(html);
  })

  let membersWhoHaveSubmitted = uniq(folio.macheSubmissions.map( ({ mache }) => {
    let members = mache.users.filter(user => user.roleNum == 1)
    members.push(mache.creator);
    return members;
  }).flat() )

  let notSubmittedMembers = state.group.members.filter( member => !membersWhoHaveSubmitted.includes(member._id) )

  notSubmittedMembers.forEach( ({ username }) => {
    let html = `<li class="list-group-item"> <a href="#">${username}</a></li>`
    folioNotYetSubmitted.append(html);
  })


}

const _pre_setHandlers = () => {

  const setCardHandlers = () => {
    $('#folioCards').find('.card').toArray()
    .forEach( c => {
      $(c).on('click', function(el) {
        const folioId = $(this).attr('data-folio_id')
        const folio = state.group.folios.find( f => f._id === folioId)
        displayFolio(folio);

        console.log(folio)
      })
    })
  }
  setCardHandlers()


  $('a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
}




adminLogic.init = () => {
  return new Promise( (resolve, reject) => {
    _pre_initState()
    .then( s => {
      _pre_setHandlers();
      return _pre_setRenderChain()
    })
    .then( _ => {
      renderChain.forEach( renderFn => renderFn() )
    })
    .then( _ => { return { user : state.user, group : state.group } })
    .catch( e => {
      console.error("Error in group init",e )
      reject(e);
    })
  })
}




module.exports = adminLogic;
