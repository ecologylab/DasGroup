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


viewHelper.renderCreateGroupForm = (appendLocation) => {
  let inputGroup = groupHtmlBuilder.formBuilder.createGroup();
  let $inputGroup = $(inputGroup.html)
  $inputGroup.find('button').on('click', inputGroup.handler())
  $(appendLocation).append($inputGroup)
  renderedComponents.push($inputGroup)
  return renderedComponents;
}

viewHelper.renderCreateFolio = (appendLocation, groupId) => {
  let inputFolio = groupHtmlBuilder.formBuilder.createFolio();
  let $inputFolio = $(inputFolio.html)
  $inputFolio.find('button').on('click', inputFolio.handler(groupId))
  $(appendLocation).append($inputFolio)
  renderedComponents.push($inputFolio)
  return renderedComponents;
}


module.exports = viewHelper;
