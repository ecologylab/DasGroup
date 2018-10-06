import apiWrapper from './apiWrapper.js';
const logic = {}




logic.getUserAndGroups = (userId, opt_groupIds) => {
  let returnData = {},
      groupIds = opt_groupIds || u.memberOf;
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', userId)
    .then( (u) => {
      returnData.user = u;
      if ( groupIds.length > 0 ) {
        return apiWrapper.getGroups('groupIds',groupIds)
      } else { resolve([])}
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

logic.addGroupMembers = (groupId, newMembers) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${base}a/addGroupMembers`, { groupQuery : { groupId : groupId }, newMembers : newMembers})
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupMembers members ', groupId, newMembers, e)
      reject(e);
    })
  })
}


module.exports = logic;
