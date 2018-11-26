const miscHelpers = {}
const logger = require('./logger')
const { groupPopulate } = require('./groupHelpers')
const { filterFoliosByPermissions } = require('./folioHelpers')
const { getQuery } = require('./getQuery')


miscHelpers.uniq = (a) => Array.from(new Set(a));

miscHelpers.uniqId = (a) => {
  a = a.map(a => a.toString() )
  return Array.from(new Set(a));
}

//This function takes a user and returns deepGroups that have only the maches the user is a part of in the folios
miscHelpers.getUsersGroupsAndPermissedMaches = async (user) => {
  try {
    const groupsLocator = { groupIds : [] }
    user.memberOf.forEach( gId => groupsLocator.groupIds.push(gId) );
    const groupQuery = getQuery(groupsLocator)
    const collect = async () => {
      const populates = [
        { path : 'folios' , populate : { path : 'macheSubmissions.mache' } },
        { path : 'members', select :  '-hash -salt -password -google'},
      ]
      const collection = {};
      collection.groups = await groupPopulate(groupQuery, populates)
      return collection;
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.groups ) {
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() ) {
          resolve(true);
        } else {
          logger.error("getDeepGroup validate error")
          reject('validateError - groups do not exist')
        }
      })
    }
    //filters the folios for non admins




    const collection = await collect('groups');
    const validated = await validate(collection);
    collection.groups = collection.groups.map( g => {
      let folioCount = g.folios.map( f => f.macheSubmissions.length )
      const isUserAdminOfGroup = g.roles.admins.indexOf(user._id) !== -1;
      console.log(`Group ${g.name}, Admin : ${isUserAdminOfGroup} Sub counts ${folioCount}`)
      g.folios = filterFoliosByPermissions(g.folios, user, isUserAdminOfGroup)
      folioCount = g.folios.map( f => f.macheSubmissions.length )
      console.log(`Group ${g.name} Admin : ${isUserAdminOfGroup} Sub counts ${folioCount}`)
      return g;
    })

    return collection;
  } catch ( err ) {
    logger.error('Error in getDeepGroup %j %O', err)
    return err;
  }
}



module.exports = miscHelpers;
