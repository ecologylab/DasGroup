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
      .then(console.log)
    }
  }
  return { html : html, handler : createHandle }
}

formBuilder.buildIconFieldHtml = (fieldName, fieldId, defaultValue, iconDetails) => {
  let icons = ``;
  for (let iconDetail in iconDetails) {
    icons += `<i class="${iconDetails[iconDetail]['class']}"
      title="${iconDetails[iconDetail]['title']}"
      val="${iconDetails[iconDetail]['value']}"
      style="color: ${iconDetails[iconDetail]['color']}; padding-left: 14px; padding-right: 4px;"></i>
      ${iconDetails[iconDetail]['title']}`
  }
  return `<div class="form-group row">
    <span class="col-sm-2 col-form-label" id="${fieldId}">${fieldName}</span>
    <div class="col-sm-8">
    <span class="icon-control" val="${defaultValue}">`
    + icons +
    `</span></div>
  </div>`;
}

formBuilder.buildInputFieldHtml = (fieldName, fieldId, fieldValue, placeholder) => {
  if (!placeholder) { placeholder = ''; }
  return `<div class="form-group row">
    <span class="col-sm-2 col-form-label" id="${fieldId}">${fieldName}</span>
    <div class="col-sm-8">
      <input type="text" class="form-control" aria-label="Default" aria-describedby="${fieldId}"
      placeholder="${placeholder}" value="${fieldValue}">
    </div>
  </div>`;
}

formBuilder.buildLabelFieldHtml = (fieldName, fieldId, fieldValue) => {
  return `<div class="form-group row">
    <span class="col-sm-2 col-form-label" id="${fieldId}">${fieldName}</span>
    <div class="col-sm-8">
      <input type="text" readonly class="form-control-plaintext link" aria-label="Default" aria-describedby="${fieldId}"
      value="${fieldValue}" size="50">
    </div>
  </div>`;
}

formBuilder.createGroup = (fieldValues) => {
  let itemId = 'form' + shortId.generate()
  if (!fieldValues) { fieldValues = {}; }
  const buildHtml = () => {
    let visiblityIcons = [{'class': 'fas fa-user-friends fa-lg', 'color': 'lightgrey', 'title': 'Private', 'value': 'private'},
        {'class': 'fas fa-globe-americas fa-lg', 'color': 'Dodgerblue', 'title': 'Public', 'value': 'public'}];
    if (fieldValues['visibility']) {
      for (let i = 0; i < visiblityIcons.length; i++) {
        if (visiblityIcons[i]['value'] === fieldValues['visibility']) {
          visiblityIcons[i]['color'] = 'Dodgerblue';
        } else {
          visiblityIcons[i]['color'] = 'lightgrey';
        }
      }
    }
    let html = `<div id=${itemId}>`
    html += formBuilder.buildInputFieldHtml('Name', 'name', `${fieldValues['name']}`)
            + formBuilder.buildInputFieldHtml('Description', 'description', `${fieldValues['description']}`);
    html += formBuilder.buildIconFieldHtml('Visibility', 'visibility', 'public', visiblityIcons);
    if (fieldValues['signup']) {
      html += formBuilder.buildLabelFieldHtml('Sign Up Link', 'signup', `${fieldValues['signup']}`);
      html += `<br><button type="button" data-performAction="Update" data-groupId=${fieldValues['groupId']} class="btn btn-outline-primary">Update course</button>`;
    } else {
      html += `<br><button type="button" data-performAction="Create" class="btn btn-outline-primary">Create course</button>`;
    }
    html += '</div>'
    return html;
  }
  let html = buildHtml()
  let createHandle = () => {
    return (el) => {
      el.preventDefault();
      const buttonElement = el.target;
      let actionPerformed = $(buttonElement).attr('data-performAction');
      const groupData = $('#' + itemId)
      .find('.form-group').toArray()
      .map( formGroup => {
        const fieldKey = $(formGroup).find('.col-form-label').attr('id');
        const attrValue = $(formGroup).find('.icon-control').attr('val');
        // .val() for input fields
        const fieldValue = attrValue? attrValue : $(formGroup).find('.form-control').val();
        return {key : fieldKey, value : fieldValue };
      })
      .reduce( (obj, item) => Object.assign(obj, { [item.key] : item.value }, {}), {})
      if (actionPerformed === 'Create') {
        apiWrapper.createGroup(groupData)
          .then( newGroup => {
          window.location.href = `/admin/${newGroup.key}`
        })
        .catch( e => console.error(e) )
      } else if (actionPerformed === 'Update') {
        let groupId = $(buttonElement).attr('data-groupId');
        delete groupData.signup;
        apiWrapper.updateGroup({groupId: groupId},
            {name: groupData.name, description: groupData.description, visibility: groupData.visibility})
          .then( updatedGroup => {
          window.location.href = `/admin/${updatedGroup.key}`
        })
        .catch( e => console.error(e) )
      }
    }
  }
  let iconHandle = () => {
    return (e) => {
      const ielt = e.target;
      const ispan = $(ielt).parent();
      const iclass = $(ielt).attr('class');
      $(ispan).attr('val', $(ielt).attr('val'));
      $(ispan).find('i').toArray()
      .forEach( i => {
        $(i).css('color', 'lightgrey');
      })
      console.log(iclass);
      $(ielt).css('color', 'Dodgerblue');
    }
  }
  return { html : html, handler : createHandle, iconselector : iconHandle }
}

formBuilder.createFolio = (fieldValues) => {
  let itemId = 'form' + shortId.generate()
  if (!fieldValues) { fieldValues = {}; }
  const buildHtml = () => {
    let visiblityIcons = [{'class': 'fas fa-cogs fa-lg', 'color': 'lightgrey', 'title': 'Admin Only', 'value': 'adminOnly'},
        {'class': 'fas fa-user-friends fa-lg', 'color': 'Dodgerblue', 'title': 'Member Only', 'value': 'memberOnly'},
        {'class': 'fas fa-globe-americas fa-lg', 'color': 'lightgrey', 'title': 'Everyone', 'value': 'everyone'}];
    let stateIcons = [{'class': 'fas fa-lock-open fa-lg', 'color': '#fab005', 'title': 'Opened', 'value': 'opened'},
        {'class': 'fas fa-lock fa-lg', 'color': 'lightgrey', 'title': 'Closed', 'value': 'closed'}];
    if (fieldValues['visibility']) {
      for (let i = 0; i < visiblityIcons.length; i++) {
        if (visiblityIcons[i]['value'] === fieldValues['visibility']) {
          visiblityIcons[i]['color'] = 'Dodgerblue';
        } else {
          visiblityIcons[i]['color'] = 'lightgrey';
        }
      }
    }
    if (fieldValues['state']) {
      for (let i = 0; i < stateIcons.length; i++) {
        if (stateIcons[i]['value'] === fieldValues['state']) {
          stateIcons[i]['color'] = '#fab005';
        } else {
          stateIcons[i]['color'] = 'lightgrey';
        }
      }
    }
    let html = `<div id=${itemId}>`
    html += formBuilder.buildInputFieldHtml('Name', 'name', `${fieldValues['name']}`)
            + formBuilder.buildInputFieldHtml('Description', 'description', `${fieldValues['description']}`);
    html += formBuilder.buildIconFieldHtml('Visibility', 'visibility', 'memberOnly', visiblityIcons);
    html += formBuilder.buildIconFieldHtml('State', 'state', 'opened', stateIcons);
    if (fieldValues.name === "") {
      html += `<br><button type="button" data-performAction="Create" class="btn btn-outline-primary">Create assignment</button>`;
    } else {
      html += `<br><button type="button" data-performAction="Update" data-folioId=${fieldValues['folioId']} class="btn btn-outline-primary">Update assignment</button>`;
    }
    html += '</div>'
    return html;
  }
  let html = buildHtml()
  let createHandle = (group) => {
    return (el) => {
      el.preventDefault();
      const buttonElement = el.target;
      let actionPerformed = $(buttonElement).attr('data-performAction');
      const folioData = $('#' + itemId)
      .find('.form-group').toArray()
      .map( formGroup => {
        const fieldKey = $(formGroup).find('.col-form-label').attr('id');
        const attrValue = $(formGroup).find('.icon-control').attr('val');
        // .val() for input fields
        const fieldValue = attrValue? attrValue : $(formGroup).find('.form-control').val();
        return {key : fieldKey, value : fieldValue };
      })
      .reduce( (obj, item) => Object.assign(obj, { [item.key] : item.value }, {}), {})
      if (actionPerformed === 'Create') {
        apiWrapper.createFolio({ 'groupId' : group._id }, folioData)
        .then( newFolio => {
          console.table(newFolio)
          window.location.href = `/folio/${newFolio._id}`
        })
        .catch( e => console.error(e) )
      } else if (actionPerformed === 'Update') {
        let folioId = $(buttonElement).attr('data-folioId');
        apiWrapper.updateFolio({ 'folioId' : folioId }, folioData)
        .then( updatedFolio => {
          console.table(updatedFolio)
          window.location.href = `/folio/${updatedFolio._id}`
        })
        .catch( e => console.error(e) )
      }
    }
  }
  let iconHandle = () => {
    return (e) => {
      const ielt = e.target;
      const ispan = $(ielt).parent();
      const iclass = $(ielt).attr('class');
      $(ispan).attr('val', $(ielt).attr('val'));
      $(ispan).find('i').toArray()
      .forEach( i => {
        $(i).css('color', 'lightgrey');
      })
      console.log(iclass);
      if (iclass.startsWith('fas fa-lock')) {
        $(ielt).css('color', '#fab005');
      } else {
        $(ielt).css('color', 'Dodgerblue');
      }
    }
  }
  return { html : html, handler : createHandle, iconselector : iconHandle}
}


builder.formBuilder = formBuilder;
builder.buttonBuilder = buttonBuilder;
module.exports = builder;
