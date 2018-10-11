const Account = require('../../models/account')
const logger = require('./logger')
const accountHelpers = {};

const findUser = (query) => {
  return new Promise( (resolve, reject) => {
    Account.find(query).exec()
    .then( (user) => {
      if ( user.length === 1 ) { resolve(user[0]) }
      else if ( user.length < 1 ) { reject('No user found')}
      else { resolve(user); }
    })
    .catch( e => {
      logger.error('Error in findUser %j %O', query, e)
      reject(e);
    })
  })
}

accountHelpers.addGroupToUser = (userQuery, groupId) => {
  return new Promise( (resolve, reject) => {
    findUser(userQuery)
    .then( user => {
      const currentGroups = user.memberOf.map( m => m.toString() )
      if ( currentGroups.includes(groupId.toString() ) ) {
        logger.info('Add group to user called with a user who is already in the group %O %O', userQuery, groupId)
        resolve(user);
      } else {
        user.memberOf.push(groupId)
        return user.save()
      }
    })
    .then( updatedUser => resolve(updatedUser))
    .catch( e => { reject(e); })
  })
}

//~~ perhaps this is silly(?)
accountHelpers.checkUserExists = (userId) => {
  return new Promise( (resolve, reject) => {
    Account.findById(userId)
    .then( user => {
      if(user) { resolve(true) }
      else { resolve(false) }
    })
    .catch( e => {
      logger.error('Error in checkUserExists %j %O', userId, e)
      reject(e);
    })
  })
}

accountHelpers.findUser = findUser;
module.exports = accountHelpers;
