const logger = require('./logger')
const Group = require('../../models/group')
const groupHelpers = {}

const findGroup = (query, options) => {
  return new Promise( (resolve, reject) => {
    query.visibility = { $ne : 'removed' }
    let queryFn = Group.find(query);
    if ( options && options.hasOwnProperty('populate') ) {
      queryFn = queryFn.populate(options.populate.name, options.populate.returnOnly);
    }
    queryFn.exec()
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

//This function is too powerful to be exposed directly
groupHelpers.groupPopulate = (groupQuery, populates, opts) => {
  return new Promise( (resolve, reject) => {
    let queryFn = Group.find(groupQuery)
    populates.forEach( populateQuery => {
      queryFn = queryFn.populate(populateQuery)
    })
    queryFn.exec()
    .then( groups => {
      if ( groups.length == 1) { resolve(groups[0]) }
      else { resolve(groups) }
    })
    .catch( e => {
      logger.error("groupPopulate collect error")
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


groupHelpers.addFolioToGroup = (groupQuery, folioId) => {
  return new Promise( (resolve, reject) => {
    findGroup(groupQuery)
    .then( group => {
      const currentFolios = group.folios.map( b => b.toString() )
      if ( currentFolios.includes( folioId.toString() ) ) {
        logger.folio('Add folio to group called with folio that is already in group %O %O', userQuery, groupId)
        resolve(group);
      } else {
        group.folios.push(folioId)
        return group.save()
      }
    })
    .then( updatedGroup => resolve(updatedGroup) )
    .catch( e => { reject(e); })
  })
}


groupHelpers.findGroup = findGroup;
module.exports = groupHelpers
