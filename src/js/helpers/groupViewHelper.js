import $ from 'jquery';
import groupHtmlBuilder from './groupHtmlBuilder.js';
import apiWrapper from '../api/apiWrapper.js';
const viewHelper = {}

const renderedComponents = []

viewHelper.getRenderedComponents = () => { return renderedComponents; }

viewHelper.renderGetMembersButton = (appendLocation, group) => {
  let button = groupHtmlBuilder.buttonBuilder.getMembers();
  let $button = $(button.html)
  $button.on('click', button.handler(group))
  $(appendLocation).append($button)
  renderedComponents.push($button)
  return renderedComponents;
}


viewHelper.renderCreateGroupForm = (appendLocation, fieldValues) => {
  let inputGroup = groupHtmlBuilder.formBuilder.createGroup(fieldValues);
  let $inputGroup = $(inputGroup.html)
  $inputGroup.find('button').on('click', inputGroup.handler())
  $inputGroup.find('i').on('click', inputGroup.iconselector())
  $(appendLocation).append($inputGroup)
  renderedComponents.push($inputGroup)
  return renderedComponents;
}

viewHelper.renderCreateFolio = (appendLocation, groupId, fieldValues) => {
  let inputFolio = groupHtmlBuilder.formBuilder.createFolio(fieldValues);
  let $inputFolio = $(inputFolio.html)
  $inputFolio.find('button').on('click', inputFolio.handler(groupId))
  $inputFolio.find('i').on('click', inputFolio.iconselector())
  $(appendLocation).append($inputFolio)
  renderedComponents.push($inputFolio)
  return renderedComponents;
}

//This is waiting replacement
viewHelper.displayFolio = (folio) => {
  const folioName = $('#folioName');
  const folioDescription = $('#folioDescription');
  const folioState = $('#folioState');
  const folioVisibility = $('#folioVisibility');
  const macheSubmissions = $('#macheSubmissions');
  const usersSubmitted = $('#usersSubmitted');
  const usersNotSubmitted = $('#usersnotSubmitted');
  macheSubmissions.html('')
  folioName.text(`Name : ${folio.name}`);
  folioDescription.text(`Description : ${folio.description}`);
  folioState.text(`State : ${folio.state}`);
  folioVisibility.text(`Visiblity : ${folio.visibility}`);

  folio.macheSubmissions.forEach( ({ mache, date_submitted }) => {
    let macheUrl = '#';
    if ( NODE_ENV === 'production' ) {
      macheUrl = `https://livemache.ecologylab.net/e/${mache.hash_key}`
    } else if ( NODE_ENV === 'staging') {
      macheUrl = `https://livestaging.ecologylab.net/e/${mache.hash_key}`
    }
    let subDate = new Date(date_submitted).toDateString()
    let html = `<li class="list-group-item"> <a href="${macheUrl}">${mache.title}</a> <span style="float:right;"> ${subDate} </span> </li>`
    macheSubmissions.append(html);
  })


}


module.exports = viewHelper;
