import $ from 'jquery';
import logic from './logic.js';
import groupHtmlBuilder from './groupHtmlBuilder.js';
import apiWrapper from './apiWrapper.js';
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

viewHelper.renderCreateBucket = (appendLocation, groupId) => {
  let inputBucket = groupHtmlBuilder.formBuilder.createBucket();
  let $inputBucket = $(inputBucket.html)
  $inputBucket.find('button').on('click', inputBucket.handler(groupId))
  $(appendLocation).append($inputBucket)
  renderedComponents.push($inputBucket)
  return renderedComponents;
}


module.exports = viewHelper;
