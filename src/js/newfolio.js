import $ from 'jquery';
import helpers from './helpers/helpers.js';
import apiWrapper from './api/apiWrapper.js'
import viewHelper from './helpers/groupViewHelper.js'
const uniq = (a) => Array.from(new Set(a));
const newfolioLogic = {};
const components = [];

const state = {
      userId : $('#user').attr('data-userId'),
      groupId : $('#group').attr('data-groupId'),
      user : {}
    }
const renderChain = []
const renderAdmin = () => {
  //if ( state.isAdmin ) {
    //viewHelper.renderGetMembersButton('#buttonArea', state.group);
    let currComponents = viewHelper.renderCreateFolio('#buttonArea', state.group,
            {name: "", description: ""});
    console.log("curr components ", currComponents)
  //}
}


const _pre_collect = () => {
  const collection = {}
  const promises = []
  return new Promise( (resolve, reject) => {
    promises.push( apiWrapper.getUser('userId', state.userId) )
    Promise.all(promises)
    .then( ([user]) => {
      collection.user = user;
      console.log("Collection", collection)
      resolve(collection);
    })
    .catch( e => {
      console.error("Error in _pre_collect ", e)
    })
  })
}

const _pre_initState = async () => {
  const collection = await _pre_collect('user')
  state.user = collection.user;
  state.group = {};
  state.group._id = state.groupId;
  return true;
}

const _pre_setRenderChain = () => {
  renderChain.push(renderAdmin);
  return true;
}



const _pre_setHandlers = () => {

  $('a').on('click', function (e) {
    //e.preventDefault()
    $(this).tab('show')
  })
}



newfolioLogic.init = () => {
  return new Promise( (resolve, reject) => {
    _pre_initState()
    .then( s => {
      _pre_setHandlers();
      return _pre_setRenderChain()
    })
    .then( _ => {
      renderChain.forEach( renderFn => renderFn() )
    })
    .then( _ => { return { user : state.user } })
    .catch( e => {
      console.error("Error in new folio init",e )
      reject(e);
    })
  })
}




module.exports = newfolioLogic;
