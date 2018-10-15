import axios from 'axios'
const wrapper = {};
wrapper.getGroups = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`${BASEPATH}a/getGroups?${key}=${value}`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getGroups ', key, value, e)
      reject(e);
    })
  })
}
//you could just getGroups then return members, but might as well expose this api function
wrapper.getGroupMembers = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`${BASEPATH}a/getGroupMembers?${key}=${value}`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getGroup members ', key, value, e)
      reject(e);
    })
  })
}
wrapper.createGroup = (group) => {
  if ( !group.hasOwnProperty('members') ) { group.members = [] }
  if ( !group.hasOwnProperty('adminIds') ) { group.adminIds = [] }
  if ( !group.hasOwnProperty('visibility') ) { group.visibility = 'public' }
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/createGroup`, group)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error creating group', group, e)
      reject(e);
    })
  })
}

//either a singular key or id { groupKey : 12312 } or { groupId : 123123}
wrapper.deleteGroup = (groupLocator) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/deleteGroup`, groupLocator)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error deleting group', groupLocator, e)
      reject(e);
    })
  })
}
wrapper.joinGroup = (groupLocator) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/joinGroup`, groupLocator)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error joining group', group, e)
      reject(e);
    })
  })
}

wrapper.updateGroup = (modifiedGroupFields) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/updateGroup`, modifiedGroupFields)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error updating group', group, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
