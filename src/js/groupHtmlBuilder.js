import $ from 'jquery';
import logic from './logic.js';
import apiWrapper from './apiWrapper.js';
import testRoutes from './tests/testRoutes.js'; //just for testing
import shortId from 'shortid'

const builder = {};
const buttonBuilder = {};
const formBuilder = {};


buttonBuilder.getMembers = (group) => {
  let itemId = 'button_' + shortId.generate()
  let html = `<button type="button" class="btn btn-primary">Get Members</button>`;
  let createHandle = () => {
    return (el) => {
      el.preventDefault;
      apiWrapper.getGroupMembers('groupKey', group.key)
      .then( members => console.log(members) )
    }
  }
  return { html : html, handler : createHandle() }
}

formBuilder.createGroup = () => {
  let itemId = 'form' + shortId.generate()
  const buildHtml = () => {
    const buildFieldHtml = (fieldName, fieldId) => {
      return `<div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="${fieldId}">${fieldName}</span>
        </div>
        <input type="text" class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default">
      </div>`;
    }
    let html = `<div id=${itemId}>`
    html += buildFieldHtml('Name', 'name') + buildFieldHtml('Description', 'description');
    html += buildFieldHtml('Visibility', 'visibility')
    html += `<button type="button" class="btn btn-primary">Create group</button>`;
    html += '</div>'
    return html;
  }
  let html = buildHtml()
  let createHandle = () => {
    //FIX ME
    return (el) => {
      el.preventDefault;
      $('#' + itemId)
      .find('.input-group').toArray()
      .map( input => {
        return 0
      })
    }
  }
  return { html : html, handler : createHandle() }
}

//just dummy for now
builder.buildPage = (user, group, state) => {
  let html = '';
  if ( state.isAdmin ) {

  }
}


builder.formBuilder = formBuilder;
builder.buttonBuilder = buttonBuilder;
module.exports = builder;
