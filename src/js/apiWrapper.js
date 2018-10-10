import axios from 'axios'
const wrapper = {}
wrapper.getUser = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`${BASEPATH}a/getUser?${key}=${value}`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getUser ', key, value, e)
      reject(e);
    })
  })
}

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
//groupLocator : singular key or id { groupKey : 12312 } or { groupId : 123123}
wrapper.createBucket = (groupLocator, bucketData) => {
  let request = { groupQuery : groupLocator, bucketData : bucketData };
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/createBucket`, request)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error creating bucket', group, e)
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


console.log('wrapper', wrapper, BASEPATH)

// .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )

module.exports = wrapper;
