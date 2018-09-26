import axios from 'axios'


const wrapper = {}

wrapper.getUser = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`/a/getUser?${key}=${value}`)
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
    axios.get(`/a/getGroups?${key}=${value}`)
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
    axios.get(`/a/getGroupMembers?${key}=${value}`)
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
    axios.post('/a/createBucket', request)
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
  return new Promise( (resolve, reject) => {
    axios.post('/a/createGroup', group)
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
    axios.post('/a/deleteGroup', groupLocator)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error deleting group', groupLocator, e)
      reject(e);
    })
  })
}

wrapper.updateGroup = (modifiedGroupFields) => {
  return new Promise( (resolve, reject) => {
    axios.post('/a/updateGroup', modifiedGroupFields)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error updating group', group, e)
      reject(e);
    })
  })
}



// .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )

module.exports = wrapper;
