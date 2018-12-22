const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findGroup = helpers.findGroup;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;



logic.renderGroup = async (req, res) => {
  try {
    const query = getQuery({groupKey : req.params.key})
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .populate('members', 'username')
        .populate('roles.admins', 'username')
        .populate({ path : 'folios' , populate : { path : 'macheSubmissions.mache' } })
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection)
        })
        .catch( e => {
          logger.error("renderGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() ) {
          resolve(true);
        } else {
          logger.error("renderGroup validate error")
          reject('validateError - group does not exist')
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);
    collection.group.folios = helpers.filterFoliosByPermissions(collection.group.folios, req.user);
    const renderData = {
      user :  req.user,
      group : collection.group,
    }
    req.user.currentGroup = collection.group._id;
    res.render('group', renderData)
  } catch ( err ) {
    logger.error('Error in renderGroup %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}

logic.renderRoot = async (req, res) => {
  try {
    const query = getQuery({ groupIds : req.user.memberOf });
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.find(query)
        .exec()
        .then( groups => {
          collection.groups = groups;
          resolve(collection)
        })
        .catch( e => {
          logger.error("renderRoot collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const groupsExist = () => {
          let successStatus = true;
          if ( !collection.groups ) {
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupsExist() ) {
          resolve(true);
        } else {
          logger.error("renderRoot validate error")
          reject('validateError - groups does not exist')
        }
      })
    }
    const collection = await collect('groups');
    const validated = await validate(collection);

    if ( req.user.memberOf.length < 1 ) { res.render('index', { user : req.user, memberOf : [], adminOf : [] }) }
    else {
      const groups = collection.groups;
      const adminOf = collection.groups.filter( g => g.roles.admins.indexOf(req.user._id) !== -1 )
      req.user.currentGroup = '';
      res.render('index', {user : req.user, memberOf : groups, adminOf : adminOf })
    }
  } catch ( err ) {
    logger.error('Error in renderRoot %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}


//first refactored
logic.getGroups = async (req, res) => {
  try {
    const query = getQuery(req.query);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Group.find(query).exec() );
        Promise.all(promises)
        .then( ([ groups ]) => {
          collection.groups = groups;
          resolve(collection);
        })
        .catch(e => {
          console.log("In the catch error block and rejecting")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        resolve(true);
      })
    }

    const collection = await collect('groups');
    const validated = await validate(collection);

    const groups = collection.groups;
    res.send(groups);

  } catch (error) {
    logger.error('Error in getGroups %j %O', req.query, e)
    res.status(404);
    res.send([])
  }
};

//This is by nature an extremley powerful function and has been done a little differently
logic.getDeepGroup = async (req, res) => {
  try {
    const groupQuery = getQuery(req.body.groupLocator);
    const collect = async () => {
      const populates = [
        { path : 'folios' , populate : { path : 'macheSubmissions.mache' } },
        { path : 'members', select :  '-hash -salt -password -google'},
      ]
      const collection = {};
      collection.group = await helpers.groupPopulate(groupQuery, populates)
      return collection;
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
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




    const collection = await collect('group');
    const validated = await validate(collection);
    if ( !collection.group.isUserAdmin(req.user) ) {
      collection.group.folios = helpers.filterFoliosByPermissions(collection.group.folios, req.user)
     }

    res.send(collection.group);
  } catch ( err ) {
    logger.error('Error in getDeepGroup %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}


logic.getGroupMembers = async (req, res) => {
  try {
    const query = getQuery(req.query);
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.find(query)
        .populate({ path : 'members', select : '-hash -salt -google -scholar_explore -password -google' })
        .exec()
        .then( groups => {
          if ( groups.length > 1 ) {
            collection.members = groups.map( g => {
              let members = {}
              members[g.key] = g.members;
              return members;
            });
          } else {
            collection.members = groups[0].members;
          }
          resolve(collection)
        })
        .catch( e => {
          logger.error("getGroupMembers collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const membersExist = () => {
          let successStatus = true;
          if ( !collection.members ) {
            successStatus = false;
          }
          return successStatus;
        }
        if ( membersExist() ) {
          resolve(true);
        } else {
          logger.error("getGroupMembers validate error")
          reject('validateError - members do not exist')
        }
      })
    }

    const collection = await collect('members');
    const validated = await validate(collection);

    const members = collection.members;
    res.send(members);
  } catch ( err ) {
    logger.error('Error in getGroupMembers %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}
//takes a groupId/key -- only updates passed fields

logic.updateGroup = async (req, res) => {
  try {
    const query = getQuery(req.body.groupLocator);
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection);
        })
        .catch( e => {
          logger.error("updateGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist'
            successStatus = false;
          }
          return successStatus;
        }
        const userIsAdmin = () => {
          let successStatus = true;
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'User is not authorized to update this group';
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && userIsAdmin() ) {
          resolve(true);
        } else {
          logger.error("updateGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);

    const group = collection.group;

    if ( req.body.hasOwnProperty('visibility') ) {
      group.visibility = req.body.visibility;
    }
    if ( req.body.hasOwnProperty('name') ) {
      group.name = req.body.name;
    }
    if ( req.body.hasOwnProperty('description') ) {
      group.description = req.body.description;
    }

    const updatedGroup = await group.save()
    res.send(updatedGroup);

  } catch ( err ) {
    logger.error('Error in updateGroup %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}

logic.joinGroup = async (req, res) => {
  try {
    const query = getQuery(req.body);
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection);
        })
        .catch( e => {
          logger.error("joinGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const groupIsNotPrivate = () => {
          let successStatus = true;
          if ( collection.group.visibility.toString() === 'private' ) {
            errorMessage = 'private group cannot be joined';
            res.status(401);
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && groupIsNotPrivate() ) {
          resolve(true);
        } else {
          logger.error("joinGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);

    collection.group.members.push(req.user._id)
    collection.group.members = uniqId( collection.group.members );
    req.user.memberOf.push(collection.group._id)
    req.user.memberOf = uniqId(req.user.memberOf);

    Promise.all( [ collection.group.save(), req.user.save() ])
    .then( ([updatedGroup, updatedUser]) => {
      res.send(updatedGroup);
    })
    .catch( e => {
      logger.error('Error in joinGroup saves')
      throw e;
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in joinGroup %j %O', req.body, err)
    res.send([])
  }
}

logic.leaveGroup = async (req, res) => {
  try {
    const groupQuery = getQuery(req.body.groupLocator);
    const userQuery = req.body.userLocator ? getQuery(req.body.userLocator) : getQuery({'userId' : req.user._id});
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Group.findOne(groupQuery).exec() );
        promises.push( Account.findOne(userQuery).exec() );
        Promise.all(promises)
        .then( ([ group, user ]) => {
          collection.group = group;
          collection.user = user;
          resolve(collection);
        })
        .catch(e => {
          logger.error('Error in demoteAdmin collect')
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const userIsMember = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(collection.user._id) === -1) {
            errorMessage = 'Group does not have user as member';
            successStatus = false;
          }
          if ( collection.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'User is not a member of this group';
            successStatus = false;
          }
          return successStatus;
        }
        const leaveInitiatorIsAdmin = () => {
          if ( !userQuery ) { return true; }
          //in this case a user query was passed, meaning a user is kicking out a member
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'User is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'User is not authorized to remove members from this group';
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && userIsMember() && leaveInitiatorIsAdmin() ) {
          resolve(true);
        } else {
          logger.error("leaveGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group', 'user');
    const validated = await validate(collection);
    const groupIndexToRemove = collection.group.members.indexOf(collection.user._id);
    const accountIndexToRemove = collection.user.memberOf.indexOf(collection.group._id);
    const adminIndexToRemove = collection.group.roles.admins.indexOf(collection.user._id);

    if ( adminIndexToRemove !== -1 ) {
       collection.group.roles.admins.splice(adminIndexToRemove, 1);
    }
    collection.group.members.splice(groupIndexToRemove, 1);
    collection.user.memberOf.splice(accountIndexToRemove, 1);

    Promise.all( [ collection.group.save(), collection.user.save() ])
    .then( ([updatedGroup, updatedUser]) => {
      res.send(updatedGroup);
    })
    .catch( e => {
      logger.error('Error in leaveGroup saves')
      throw e;
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in leaveGroup %j %O', req.body, err)
    res.send([])
  }
}
//req.body : groupQuery, userQuery
logic.promoteToAdmin = async (req, res) => {
  try {
    const groupQuery = getQuery(req.body.groupLocator);
    const userQuery = getQuery(req.body.userLocator);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Group.findOne(groupQuery).exec() );
        promises.push( Account.findOne(userQuery).exec() );
        Promise.all(promises)
        .then( ([ group, user ]) => {
          collection.group = group;
          collection.user = user;
          resolve(collection);
        })
        .catch(e => {
          logger.error('Error in promoteToAdmin collect')
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const promotingUserIsAdmin = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have promoting user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'Promoting user is not a member of this group';
            successStatus = false;
          }
          if ( collection.group.roles.admins.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have promoting user as admin';
            successStatus = false;
          }
          return successStatus;
        }
        const newAdminChecks = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(collection.user._id) === -1) {
            errorMessage = 'Group must have member before member can be promoted';
            successStatus = false;
          }
          if ( collection.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'user to be promoted is not a member of this group';
            successStatus = false;
          }
          if ( collection.group.roles.admins.indexOf(collection.user._id) !== -1) {
            errorMessage = 'Group already has this user as an admin';
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && promotingUserIsAdmin() && newAdminChecks() ) {
          resolve(true);
        } else {
          logger.error("promoteToAdmin validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group', 'user');
    const validated = await validate(collection);

    collection.group.roles.admins.push(collection.user._id);
    const updatedGroup = await collection.group.save();

    res.send(updatedGroup);
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in promoteToAdmin %j %O', req.body, err)
    res.send([])
  }
}

//req.body : groupQuery, userQuery
logic.demoteAdmin = async (req, res) => {
  try {
    const groupQuery = getQuery(req.body.groupLocator);
    const userQuery = getQuery(req.body.userLocator);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Group.findOne(groupQuery).exec() );
        promises.push( Account.findOne(userQuery).exec() );
        Promise.all(promises)
        .then( ([ group, user ]) => {
          collection.group = group;
          collection.user = user;
          resolve(collection);
        })
        .catch(e => {
          logger.error('Error in demoteAdmin collect')
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const demotingUserIsAdmin = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have Demoting user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'Demoting user is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'Group does not have Demoting user as admin';
            successStatus = false;
          }
          return successStatus;
        }
        const removedAdminChecks = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(collection.user._id) === -1) {
            errorMessage = 'Group must have member before member can be demoted';
            successStatus = false;
          }
          if ( collection.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'user to be demoted is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(collection.user) ) {
            errorMessage = 'Group does not have this user as an admin';
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && demotingUserIsAdmin() && removedAdminChecks() ) {
          resolve(true);
        } else {
          logger.error("demoteToAdmin validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group', 'user');
    const validated = await validate(collection);

    const adminIndexToRemove = collection.group.roles.admins.indexOf(collection.user._id);
    collection.group.roles.admins.splice(adminIndexToRemove, 1);
    const updatedGroup = await collection.group.save();

    res.send(updatedGroup);
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in demoteAdmin %j %O', req.body, err)
    res.send([])
  }
}


//This function does not have a collect / validate for obvious reasons
logic.createGroup = (req, res) => {
  if ( !req.body.visibility || req.body.visibility !== 'public' || req.body.visibility !== 'private' ) {
      req.body.visibility = 'public';
  }
  const g = new Group({
    "creator" : req.user._id,
    "roles.admins" : [req.user._id],
    "members" : [req.user._id],
    "visibility" : req.body.visibility,
    "name" : req.body.name,
    "description" : req.body.description
  })
  req.user.memberOf.push(g._id);
  Promise.all([ g.save(), req.user.save() ])
  .then( ([createdGroup, updatedUser]) => {
    res.send(createdGroup);
  })
  .catch( e => {
    res.status(404);
    logger.error('Error in createGroup %O %O', req.body, e)
    res.send({})
  })
}


logic.deleteGroup = async (req, res) => {
  try {
    const query = getQuery(req.body);
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection);
        })
        .catch( e => {
          logger.error("deleteGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const deletingUserIsAdmin = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have deleting user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'deleting user is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'Group does not have deleting user as admin';
            successStatus = false;
          }
          return successStatus;
        }

        if ( groupExists() && deletingUserIsAdmin() ) {
          resolve(true);
        } else {
          logger.error("deleteGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);
    collection.group.pseudoRemove()
    .then( res.send({success : true}) )
    .catch( e => {
      logger.error('Error in deleteGroup remove')
      throw e;
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in deleteGroup %j %O', req.body, err)
    res.send([])
  }
}

//Strictly for testing
logic.addGroupMembers = (req, res) => {
  const query = getQuery(req.body.groupLocator);
  let group, userChecks, newGroupMembers;
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new RequestError('User is not authorized to add members this group', 1) }
    group = adminStatus.group;
    userChecks = req.body.newMembers.map( m => helpers.checkUserExists(m) )
    newGroupMembers = uniqId(group.members.concat(req.body.newMembers))
    return Promise.all(userChecks)
  })
  .then( usersExist => {
    usersExist.forEach( c => { if ( c !== true ) { throw new RequestError('Cannot add nonexistant user to group') } })
    group.members = newGroupMembers
    return group.save()
  })
  .then( updatedGroup => {
    group = updatedGroup;
    return Promise.all( newGroupMembers.map( m => helpers.addGroupToUser({ _id : m }, updatedGroup._id) ) )
  })
  .then( updatedUsers => res.send(group) )
  .catch( e => {
    logger.error('Error in addGroupMembers %j %O %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}
logic.removeGroupMembers = (req, res) => {
  const query = getQuery(req.body.groupLocator);
  let group, removeUsers;
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new RequestError('User is not authorized to remove users this group', 1) }
    group = adminStatus.group;
    group.members = group.members.filter( memberId => !req.body.removeUsers.includes( memberId.toString() ) )
    return group.save()
  })
  .then( updatedGroup => res.send(updatedGroup))
  .catch( e => {
    logger.error('Error in removeGroupMembers %j %O %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

logic.findGroup = findGroup;
module.exports = logic;
