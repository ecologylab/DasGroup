import $ from 'jquery';
import logic from './logic.js';
import groupHtmlBuilder from './groupHtmlBuilder.js';
import apiWrapper from './apiWrapper.js';
const viewHelper = {}

const renderedComponents = []

viewHelper.getRenderedComponents = () => { return renderedComponents; }

viewHelper.renderGetMembersButton = (appendLocation, group) => {
  let button = groupHtmlBuilder.buttonBuilder.getMembers(group);
  let $button = $(button.html)
  $button.on('click', button.handler)
  $(appendLocation).append($button)
  renderedComponents.push($button)
  return renderedComponents;
}


viewHelper.renderCreateGroupForm = (appendLocation) => {
  let inputGroup = groupHtmlBuilder.formBuilder.createGroup();
  let $inputGroup = $(inputGroup.html)
  $inputGroup.find('button').on('click', inputGroup.handler)
  $(appendLocation).append($inputGroup)
  renderedComponents.push($inputGroup)
  return renderedComponents;
}





module.exports = viewHelper;
