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

//these next few functions should be organized accordingly. placing here for the proof of concept and to help ajit
const displayFolio = (folio) => {
  const folioName = $('#folioName');
  const folioDescription = $('#folioDescription');
  const folioState = $('#folioState');
  const folioVisibility = $('#folioVisibility');
  const macheSubmissions = $('#macheSubmissions');
  const usersSubmitted = $('#usersSubmitted');
  const usersNotSubmitted = $('#usersnotSubmitted');
  folioState.html('')
  folioVisibility.html('')
  macheSubmissions.html('')
  usersSubmitted.html('')
  usersNotSubmitted.html('')

  folioName.text(`Name : ${folio.name}`);
  folioDescription.text(`Description : ${folio.description}`);

  // styles for state and visibility icons
  let unselectedStyle = 'style="color: lightgrey; padding: 4px"'
  let stateSelectedStyle = 'style="color: #fab005; padding: 4px"'
  let visSelectedStyle = 'style="color: Dodgerblue; padding: 4px"'

  let stateIcon = '';
  let openIconClass = 'class="fas fa-lock-open"'
  let closeIconClass = 'class="fas fa-lock"'
  if (folio.state === 'opened') {
    stateIcon = '<i ' + openIconClass + stateSelectedStyle + '></i>' + '<i ' + closeIconClass + unselectedStyle + '></i>';
  } else if (folio.state === 'closed') {
    stateIcon = '<i ' + closeIconClass + stateSelectedStyle + '></i>' + '<i ' + openIconClass + unselectedStyle + '></i>';
  }
  folioState.append(`<span>State : ` + stateIcon + `</span>`);

  let visibilityIcon = '';
  let adminIconClass = 'class="fas fa-cogs"'
  let memberIconClass = 'class="fas fa-user-friends"'
  let everyoneIconClass = 'class="fas fa-globe-americas"'
  if (folio.visibility === 'adminOnly') {
    visibilityIcon = '<i ' + adminIconClass + visSelectedStyle + '></i>' + '<i ' + memberIconClass + unselectedStyle + '></i>' + '<i ' + everyoneIconClass + unselectedStyle + '></i>';
  } else if (folio.visibility === 'memberOnly') {
    visibilityIcon = '<i ' + memberIconClass + visSelectedStyle + '></i>' + '<i ' + adminIconClass + unselectedStyle + '></i>' + '<i ' + everyoneIconClass + unselectedStyle + '></i>';
  } else if (folio.visibility === 'everyone') {
    visibilityIcon = '<i ' + everyoneIconClass + visSelectedStyle + '></i>' + '<i ' + adminIconClass + unselectedStyle + '></i>' + '<i ' + memberIconClass + unselectedStyle + '></i>';
  }
  folioVisibility.append(`<span>Visibility : ` + visibilityIcon + `</span>`);

  const userPromises = [];
  let usernames = {};
  folio.macheSubmissions.forEach( (submission) => {
    userPromises.push(apiWrapper.getUser('userId', submission.submitter))
  })
  Promise.all(userPromises).then( users => {
    users.forEach( u => {
      let uid = u._id;
      if (!(uid in usernames)) {
        usernames[uid] = u.username;
      }
    })

    folio.macheSubmissions.forEach( (submission) => {
      let macheUrl = '#';
      if ( NODE_ENV === 'production' ) {
        macheUrl = `https://livemache.ecologylab.net/e/${submission.mache.hash_key}`
      } else if ( NODE_ENV === 'staging') {
        macheUrl = `https://livestaging.ecologylab.net/e/${submission.mache.hash_key}`
      }
      let date_submitted = new Date(submission.date_submitted);
      let hours = formatDateComponent(date_submitted.getHours());
      let minutes = formatDateComponent(date_submitted.getMinutes());
      let seconds = formatDateComponent(date_submitted.getSeconds());
      date_submitted = date_submitted.toDateString() + " " + hours + ":" + minutes + ":"+ seconds;
      let html = `<tr><td> <a href="${macheUrl}">${submission.mache.title}</a></td><td>${date_submitted}</td><td>${usernames[submission.submitter]}</td></tr>`
      macheSubmissions.append(html);
    })
  })

  let membersWhoHaveSubmitted = uniq(folio.macheSubmissions.map( ({ mache }) => {
    let members = mache.users.filter(user => user.roleNum == 1)
    //so that the map doesnt need to cast
    members.push({ user : mache.creator})
    return members;
  }).flat().map( macheUser => macheUser.user ) )
  if ( membersWhoHaveSubmitted.length > 0 ) {
    membersWhoHaveSubmitted.forEach( (memberId) => {
      let user = state.group.members.find(m => m._id == memberId)
      if ( user ) {
        let html = `<li class="list-group-item"> <a href="#">${user.username}</a></li>`
        usersSubmitted.append(html);
      }
    })
  }
  let notSubmittedMembers = state.group.members.filter( member => !membersWhoHaveSubmitted.includes(member._id) )
  if ( notSubmittedMembers.length > 0 ) {
    notSubmittedMembers.forEach( ({ username }) => {
      let html = `<li class="list-group-item"> <a href="#">${username}</a></li>`
      usersNotSubmitted.append(html);
    })
  }



}

const formatDateComponent = function(val) {
  return (val < 10) ? "0" + val : val.toString();
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
    $('#admins').append(li)
    console.error("Error promoting to admin ", e)
  })
  $('#admins').append(li)
  li.find('i').removeClass('fa-arrow-circle-up').addClass('fa-arrow-circle-down')
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

  const setCardHandlers = () => {
    $('#folioCards').find('.card').toArray()
    .forEach( c => {
      $(c).on('click', function(el) {
        const folioId = $(this).attr('data-folio_id')
        const folio = state.group.folios.find( f => f._id === folioId)
        displayFolio(folio);
      })
    })
  }
  setCardHandlers();
  setPromoteHandlers();

  $('a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
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
