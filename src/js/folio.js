import $ from 'jquery';
import helpers from './helpers/helpers.js';
import apiWrapper from './api/apiWrapper.js'
import viewHelper from './helpers/groupViewHelper.js'
const uniq = (a) => Array.from(new Set(a));
const folioLogic = {};
const components = [];

const state = {
      userId : $('#user').attr('data-userId'),
      folioId : $('#folio').attr('data-folioId'),
      groupId : $('#group').attr('data-groupId'),
      folioState : $('#folio').attr('data-folioState'),
      folioVisiblity : $('#folio').attr('data-folioVisibility'),
      user : {},
      folio : {},
      group : {}
    }
const renderChain = []
const renderFolio = () => {
  if ( state.isAdmin ) {
    let currComponents = viewHelper.renderCreateFolio('#buttonArea', state.group,
              {name: state.folio.name,
              description: state.folio.description,
              state: state.folio.state,
              visibility: state.folio.visibility,
              folioId: state.folioId});
    console.log("curr components ", currComponents);
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
  state.group = collection.group;
  state.folio = collection.group.folios.find( f => f._id === state.folioId);
  if ( collection.user.memberOf.includes(state.groupId) ) { state.isMember = true; }
  if ( state.isMember === false && state.group.visiblity === 'private' ) {
    window.location.href = '/';
  }
  if ( collection.group.roles.admins.includes(state.userId) ) {
    state.isAdmin = true;
  }
  return true;
}

const _pre_setRenderChain = () => {
  if ( state.isMember === true ) {
    // renderChain.push(renderPage); //in the future perhaps this is needed
    if ( state.isAdmin === true ) { renderChain.push(renderFolio); }
  }
  return true;
}

const fillHeading = () => {
  const heading = $('#heading');
  heading.html(`<div style="display:inline-block; padding-right: 30px; vertical-align: top;">
                  <div><span style='color: grey; font-size: .6em;'>Course</h6></div>
                  <div><h5><a style='color: #777777;' href='/admin/${state.group.key}'>${state.group.name}</a></h5></div>
                </div>
                <div style="display:inline-block;">
                  <div><h6 style='color: grey;'>Assignment</h6></div>
                  <div><h3>${state.folio.name}</h3></div>
                </div>`)
}

//these next few functions should be organized accordingly. placing here for the proof of concept and to help ajit
const displayCurationInfo = (folio) => {
  const macheSubmissions = $('#macheSubmissions');
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
      let date_submitted = formatDate(new Date(submission.date_submitted));
      let analytics = `<td>0</td><td>${submission.mache.elements.length}</td><td>0</td><td>0</td><td>0</td><td>0</td>`;
      let html = `<tr><td>${usernames[submission.submitter]}</td><td><a class="link" href="${macheUrl}">${submission.mache.title}</a></td>` + analytics + `<td>${date_submitted}</td></tr>`
      macheSubmissions.append(html);
    })
  })

}


const formatDate = function(date) {
  const formatDateComponent = function(val) {
    return (val < 10) ? "0" + val : val.toString();
  }
  let hours = formatDateComponent(date.getHours());
  let minutes = formatDateComponent(date.getMinutes());
  //let seconds = formatDateComponent(date.getSeconds());
  let dateString = date.toDateString();
  let dateWithoutDayAndYear = dateString.substring(dateString.indexOf(' ') + 1, dateString.lastIndexOf(' '));
  return dateWithoutDayAndYear + " " + hours + ":" + minutes;// + ":"+ seconds;
}



const _pre_setHandlers = () => {

  $('a').on('click', function (e) {
    //e.preventDefault()
    $(this).tab('show')
    if ($(this).attr('id') === 'settings_tab')
    {
      $("#macheSubmissions").hide();

      $("#buttonArea").show();
    }
    if ($(this).attr('id') === 'curations_tab')
    {
      $("#buttonArea").hide();

      $("#macheSubmissions").show();
    }
  })
}



folioLogic.init = () => {
  return new Promise( (resolve, reject) => {
    _pre_initState()
    .then( s => {
      _pre_setHandlers();
      fillHeading();
      displayCurationInfo(state.folio);
      return _pre_setRenderChain()
    })
    .then( _ => {
      renderChain.forEach( renderFn => renderFn() )
    })
    .then( _ => { return { user : state.user, folio : state.folio } })
    .catch( e => {
      console.error("Error in folio init",e )
      reject(e);
    })
  })
}




module.exports = folioLogic;
