import apiWrapper from './apiWrapper.js';
const logic = {}




logic.getUserAndGroups = (userId) => {
  let returnData = {};
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', userId)
    .then( (u) => {
      returnData.user = u;
      return apiWrapper.getGroups('groupIds',u.memberOf)
    })
    .then( groups => {
        returnData.groups = groups;
        resolve(returnData);
    })
    .catch( e => {
      console.error("Error in get user and groups", e)
      reject(e);
    })
  })
}


module.exports = logic;
