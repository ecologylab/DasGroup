const logger = require('./logger')
const Group = require('../../models/group')
const Mache = require('../../models/mache')
const macheHelpers = {}

const findMache = (query) => {
  return new Promise( (resolve, reject) => {
    Mache.find(query).exec()
    .then( (mache) => {
      if ( mache.length === 1 ) { resolve(mache[0]) }
      else if ( mache.length < 1 ) { reject('No mache found')}
      else { resolve(mache); }
    })
    .catch( e => {
      logger.error('Error in findMache %j %O', query, e)
      reject(e);
    })
  })
}

macheHelpers.isUserPartOfMache = (mache, user) => {
  let usersInvolved = mache.users.filter( u => u.roleNum === 1)
  usersInvolved.push({ "user" : mache.creator})
  if ( usersInvolved.find( u => u.user.toString() == user._id.toString() ) ) {
    return true
  }
  else { return false; }
}


macheHelpers.getDelegatedPermissions = async (mache, user) => {
  const groups = await Group.find({ _id : { $in : user.memberOf } }).populate('folios').exec()
  const delegationData = [];
  groups.forEach( group => {
    const foliosIncludingMache = group.folios.filter( f => f.macheSubmissions.map( sub => sub.mache.toString() ).includes(mache._id.toString() ) )
    foliosIncludingMache.forEach( f => {
      let folioPermissions = f.toObject().permissionSettings;
      folioPermissions.adminPermissions.admins = group.roles.admins;
      folioPermissions.memberPermissions.members = group.members;
      delegationData.push(folioPermissions)
    })
  })
  return delegationData;
}




macheHelpers.findMache = findMache;
module.exports = macheHelpers;
