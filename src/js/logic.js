import axios from 'axios'


const logic = {}

//{ userId : } or { username : } or { email : }
logic.getUser = (key, value) => {
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

logic.getGroup = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`/a/getGroup?${key}=${value}`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getGroup ', key, value, e)
      reject(e);
    })
  })
}
logic.getGroups = (key, value) => {
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

// .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )

module.exports = logic;
