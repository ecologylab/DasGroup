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
    //viewHelper.renderGetMembersButton('#buttonArea', state.group);
    let signUpUrl = "https://livemache.ecologylab.net/g/group/" + state.group.key;
    let currComponents = viewHelper.renderCreateGroupForm('#buttonArea',
        {name: state.group.name,
         description: state.group.description,
         visibility: state.group.visibility,
         signup: signUpUrl,
         groupId: state.groupId});
    console.log("curr components ", currComponents)
  }
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
  if ( collection.group.roles.admins.includes(state.userId) ) {
    state.isAdmin = true;
  }
  return true;
}

const _pre_setRenderChain = () => {
  if ( state.isMember === true ) {
    // renderChain.push(renderPage); //in the future perhaps this is needed
    if ( state.isAdmin === true ) { renderChain.push(renderAdmin); }
  } else if (state.groupVisiblity !== 'private' ) {
    renderChain.push(renderInvite)
  }
  return true;
}

const demoteAdmin = function(el) {
  const li = $(this).parent()
  const span = $(this);
  const adminId = li.attr('data-user_id')
  apiWrapper.demoteAdmin({ groupKey : state.group.key}, { userId : adminId })
  .then( updatedGroup => {
    span.off();
    span.on('click', promoteToAdmin )
  })
  .catch( e => {
    //demote failed so need paint backwards
    li.find('i').removeClass('fa-arrow-circle-up').addClass('fa-arrow-circle-down')
    $('#admins').append(li)
    console.error("Error demoting admin ", e)
  })
  $('#members').append(li)
  li.find('i').removeClass('fa-arrow-circle-down').addClass('fa-arrow-circle-up')
  console.log(li);
}

const promoteToAdmin = function(el) {
  const li = $(this).parent()
  const span = $(this);
  const memberId = li.attr('data-user_id')
  apiWrapper.promoteToAdmin({ groupKey : state.group.key}, { userId : memberId })
  .then( updatedGroup => {
    span.off();
    span.on('click', demoteAdmin )
  })
  .catch( e => {
    li.find('i').removeClass('fa-arrow-circle-down').addClass('fa-arrow-circle-up')
    $('#members').append(li)
    console.error("Error promoting to admin ", e)
  })
  $('#admins').append(li)
  li.find('i').removeClass('fa-arrow-circle-up').addClass('fa-arrow-circle-down')
}

const createFolioForm = (el) => {
  console.log("in create group form")
  window.location.href = '/newfolio/' + state.group.key;
}

const _pre_setHandlers = () => {

  const setPromoteHandlers = () => {
    $('#admins').find('li').toArray()
    .map( li => $(li).find('span') )
    .forEach( demoteSpan => {
      demoteSpan.on('click', demoteAdmin )
    })
    $('#members').find('li').toArray()
    .map( li => $(li).find('span') )
    .forEach( promoteSpan => {
      promoteSpan.on('click', promoteToAdmin )
    })
  }

  setPromoteHandlers();

  $('a').on('click', function (e) {
    //e.preventDefault()
    $(this).tab('show');
    if ($(this).attr('id') === 'settings_tab')
    {
      $("#chart").hide();
      $("#assignments").hide();
      $('#createNewFolio').hide();

      $("#buttonArea").show();
      $("#roles").show();
    }
    if ($(this).attr('id') === 'assignments_tab')
    {
      $("#buttonArea").hide();
      $("#roles").hide();

      $("#chart").show();
      $("#assignments").show();
      $('#createNewFolio').show();
    }
  })

  $('#createNewFolio').on('click', createFolioForm)
}


const removeAdminsFromMembers = () => {
  const adminIds = $('#admins').find('li').toArray().map( li => $(li).attr('data-user_id') )
  $('#members').find('li').toArray()
  .forEach( li => {
    const memberId = $(li).attr('data-user_id')
    if ( adminIds.includes(memberId) ) {
      $(li).remove()
    }
  })

}


adminLogic.init = () => {
  return new Promise( (resolve, reject) => {
    _pre_initState()
    .then( s => {
      _pre_setHandlers();
      removeAdminsFromMembers();
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
