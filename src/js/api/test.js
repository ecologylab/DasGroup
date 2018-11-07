import axios from 'axios'
const wrapper = {};

wrapper.addGroupMembers = (groupLocator, newMembers) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}t/addGroupMembers`, {groupLocator : groupLocator, newMembers : newMembers})
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupMembers', groupLocator, e)
      reject(e);
    })
  })
}

wrapper.removeGroupMembers = (groupLocator, removeUsers) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}t/addGroupMembers`, {groupLocator : groupLocator, removeUsers : removeUsers})
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupMembers', groupLocator, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
