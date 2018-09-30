const tokenHandler = require('../../utils/tokenHandler.js')
const authHelper = require('../../utils/authHelper.js')
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const getQuery = require('./getQuery');
const logic = {};


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

logic.addGroupToUser = (userQuery, groupId) => {
  return new Promise( (resolve, reject) => {
    findUser(userQuery)
    .then( user => {
      const currentGroups = user.memberOf.map( m => m.toString() )
      if ( currentGroups.includes(groupId.toString() ) ) {
        logger.info('Add group to user called with a user who is already in the group %O %O', userQuery, groupId)
        resolve(user);
      } else {
        user.memberOf.push(groupId)
        user.save()
        .then( updatedUser => resolve(updatedUser))
        .catch( e => { reject(e); })
      }
    })
  })
}

logic.prelog = (req, res) => {
  const decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    const user = decryptedToken.data;
    authHelper.autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.redirect('/')
    }).catch( (e) => {
      logger.error("error in prelog", e)
    })
  } else {
    res.render('error')
  }
}

logic.checkUserExists = (userId) => {
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

logic.getUser = (req, res) => {
  const query = getQuery(req.query);
  findUser(query)
  .then( user => res.send(user))
  .catch( e => {
    logger.error('Error in getUser %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
};



module.exports = logic;
