import $ from 'jquery';
import apiWrapper from '../api/apiWrapper.js';
import testRoutes from '../tests/testRoutes.js'; //just for testing
import shortId from 'shortid'

const builder = {};
const buttonBuilder = {};
const formBuilder = {};

buttonBuilder.getMembers = () => {
  let itemId = 'button_' + shortId.generate()
  let html = `<button type="button" class="btn btn-primary">Get Members</button>`;
  let createHandle = (group) => {
    return (el) => {
      el.preventDefault;
      apiWrapper.getGroupMembers('groupKey', group.key)
      .then( members => console.log(members) )
    }
  }
  return { html : html, handler : createHandle }
}

formBuilder.createGroup = () => {
  let itemId = 'form' + shortId.generate()
  const buildHtml = () => {
    const buildFieldHtml = (fieldName, fieldId, placeholder) => {
      if (!placeholder) { placeholder = ''; }
      return `<div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="${fieldId}">${fieldName}</span>
        </div>
        <input type="text" class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="${placeholder}">
      </div>`;
    }
    let html = `<div id=${itemId}>`
    html += buildFieldHtml('Name', 'name') + buildFieldHtml('Description', 'description');
    html += buildFieldHtml('Visibility', 'visibility', 'public or private')
    html += `<button type="button" class="btn btn-primary">Create group</button>`;
    html += '</div>'
    return html;
  }
  let html = buildHtml()
  let createHandle = () => {
    return (el) => {
      el.preventDefault();
      const groupData = $('#' + itemId)
      .find('.input-group').toArray()
      .map( inputGroup => {
        const fieldKey = $(inputGroup).find('.input-group-prepend span').attr('id');
        const fieldValue = $(inputGroup).find('.form-control').val();
        return {key : fieldKey, value : fieldValue };
      })
      .reduce( (obj, item) => Object.assign(obj, { [item.key] : item.value }, {}), {})
      apiWrapper.createGroup(groupData)
      .then( newGroup => {
        window.location.href = `./group/${newGroup.key}`
      })
      .catch( e => console.error(e) )
    }
  }
  return { html : html, handler : createHandle }
}

formBuilder.createFolio = () => {
  let itemId = 'form' + shortId.generate()
  const buildHtml = () => {
    const buildFieldHtml = (fieldName, fieldId, placeholder) => {
      if (!placeholder) { placeholder = ''; }
      return `<div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="${fieldId}">${fieldName}</span>
        </div>
        <input type="text" class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="${placeholder}">
      </div>`;
    }
    let html = `<div id=${itemId}>`
    html += buildFieldHtml('Name', 'name') + buildFieldHtml('Description', 'description');
    html += buildFieldHtml('Visibility', 'visibility', 'public or private');
    html += buildFieldHtml('State', 'state', 'opened or closed');
    html += `<button type="button" class="btn btn-primary">Create folio</button>`;
    html += '</div>'
    return html;
  }
  let html = buildHtml()
  let createHandle = (group) => {
    return (el) => {
      el.preventDefault();
      const folioData = $('#' + itemId)
      .find('.input-group').toArray()
      .map( inputGroup => {
        const fieldKey = $(inputGroup).find('.input-group-prepend span').attr('id');
        const fieldValue = $(inputGroup).find('.form-control').val();
        return {key : fieldKey, value : fieldValue };
      })
      .reduce( (obj, item) => Object.assign(obj, { [item.key] : item.value }, {}), {})
      apiWrapper.createFolio({ 'groupId' : group._id }, folioData)
      .then( newFolio => {
        console.table(newFolio)
        // window.location.href = `./group/${newGroup.key}`
      })
      .catch( e => console.error(e) )
    }
  }
  return { html : html, handler : createHandle }
}


builder.formBuilder = formBuilder;
builder.buttonBuilder = buttonBuilder;
module.exports = builder;
