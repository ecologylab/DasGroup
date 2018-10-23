import axios from 'axios'
const wrapper = {};
//key is groupId(s) or groupKey(s)
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
//key is groupId(s) or groupKey(s)
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

wrapper.getGroupAndPopulate = (groupLocator) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/getGroupAndPopulate`, groupLocator)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getting and populating group', groupLocator, e)
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
//either a singular key or id { groupKey : 12312 } or { groupId : 123123}
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

//either a singular key or id { groupKey : 12312 } or { groupId : 123123}
//IMPORTANT! if a userQuery is not supplied this removes the acting user from the group
wrapper.leaveGroup = (groupQuery, userQuery) => {
  const params = { groupQuery : groupQuery };
  if  ( userQuery ) { params.userQuery = userQuery; }
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/leaveGroup`, params)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error leaving group', groupQuery, userQuery, e)
      reject(e);
    })
  })
}

wrapper.promoteToAdmin = (groupQuery, userQuery) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/promoteToAdmin`, {groupQuery : groupQuery, userQuery : userQuery})
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error promoting user to admin', groupQuery, userQuery, e)
      reject(e);
    })
  })
}

wrapper.demoteAdmin = (groupQuery, userQuery) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/demoteAdmin`, {groupQuery : groupQuery, userQuery : userQuery})
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error demoting user to admin', groupQuery, userQuery, e)
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
