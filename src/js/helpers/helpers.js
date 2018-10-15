import apiWrapper from '../api/apiWrapper.js';
const helpers = {}




helpers.getUserAndGroups = (userId, opt_groupIds) => {
  let returnData = {},
      groupIds = opt_groupIds;
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', userId)
    .then( (u) => {
      if ( !groupIds ) { groupIds = u.memberOf; }
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




module.exports = helpers;
