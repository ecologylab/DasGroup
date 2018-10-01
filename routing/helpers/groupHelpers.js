const logger = require('./logger')
const groupHelpers = {}

groupHelpers.findGroup = (query) => {
  return new Promise( (resolve, reject) => {
    Group.find(query).exec()
    .then( (group) => {
      if ( group.length === 1 ) { resolve(group[0]) }
      else if ( group.length < 1 ) { reject('No group found')}
      else { resolve(group); }
    })
    .catch( e => {
      logger.error('Error in findGroup %j %O', query, e)
      reject(e);
    })
  })
}

groupHelpers.isUserAdminOfGroup = (groupQuery, user) => {
  return new Promise( (resolve, reject) => {
    Promise.all( [ findGroup(groupQuery), user.getAdminOf(Group) ])
    .then( resolves => {
      const group = resolves[0],
            adminOf = resolves[1];
      if ( adminOf.includes( group._id.toString() ) ) { resolve({ isAdmin : true, group : group }); }
      else { resolve({ isAdmin : false, group : group }); }
    })
    .catch( e => reject(e) )
  })
}

groupHelpers.addBucketToGroup = (groupQuery, bucketId) => {
  return new Promise( (resolve, reject) => {
    findGroup(groupQuery)
    .then( group => {

    })
  })
}

module.exports = groupHelpers
