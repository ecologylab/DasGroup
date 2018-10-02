require('dotenv').config()
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const helpers = require('../helpers/helpers')
const logic = {};

const uniq = helpers.uniq;
const getQuery = helpers.getQuery;
const findGroup = helpers.findGroup;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;



//This getGroups differs from the Account model method in that it takes a list of groupIds or keys where the account model expects a user
logic.getGroups = (req, res) => {
  const query = getQuery(req.query);
  findGroup(query)
  .then( groups => {
    if ( Array.isArray(groups) ) { res.send(groups); }
    else { res.send([groups]) }
  })
  .catch( (e) => {
    logger.error('Error in getGroups %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
};

logic.getGroupMembers = (req, res) => {
  const query = getQuery(req.query);
  findGroup(query)
  .then( group => group.getGroupMembers(Account) )
  .then( members => res.send(members) )
  .catch( (e) => {
    logger.error('Error in getGroupMembers %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
}
//takes a groupId/key -- only updates passed fields
logic.updateGroup = (req, res) => {
  const query = getQuery(req.body.groupQuery);
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to update this group') }
    const group = adminStatus.group;
    if ( req.body.hasOwnProperty('visibility') ) {
      group.visibility = req.body.visibility;
    }
    if ( req.body.hasOwnProperty('name') ) {
      group.name = req.body.name;
    }
    if ( req.body.hasOwnProperty('description') ) {
      group.description = req.body.description;
    }
    return group.save();
  })
  .then( updatedGroup => res.send(updatedGroup) )
  .catch( e => {
    logger.error('Error in updateGroup %j %O %O', req.groupQuery, req.user, e)
    res.status(404);
    res.send({})
  })
}





//groupQuery, newMembers [userIds]
logic.addGroupMembers = (req, res) => {
  const query = getQuery(req.body.groupQuery);
  let group, userChecks, newGroupMembers;
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to add members this group') }
    group = adminStatus.group;
    userChecks = req.body.newMembers.map( m => helpers.checkUserExists(m) )
    newGroupMembers = uniq(group.members.concat(req.body.newMembers))
    return Promise.all(userChecks)
  })
  .then( usersExist => {
    usersExist.forEach( c => { if ( c !== true ) { throw new Error('Cannot add nonexistant user to group') } })
    group.members = newGroupMembers
    return group.save()
  })
  .then( updatedGroup => {
    group = updatedGroup;
    return Promise.all( newGroupMembers.map( m => helpers.addGroupToUser({ _id : m }, updatedGroup._id) ) )
  })
  .then( updatedUsers => {console.log("addGroupMembers", group); res.send(group)} )
  .catch( e => {
    logger.error('Error in addGroupMembers %j %O %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

//groupQuery, newAdmins [userIds]
logic.addGroupAdmins = (req, res) => {
  const query = getQuery(req.body.groupQuery);
  let group, userChecks, newAdmins;
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to add admins this group') }
    group = adminStatus.group;
    userChecks = req.body.newAdmins.map( m => helpers.checkUserExists(m) )
    newAdmins = uniq(group.roles.admins.concat(req.body.newAdmins))
    return Promise.all(userChecks)
  })
  .then( usersExist => {
    usersExist.forEach( c => { if ( c !== true ) { throw new Error('Cannot add nonexistant user to group admins') } })
    group.roles.admins = newAdmins
    return group.save()
  })
  .then( updatedGroup => {
    group = updatedGroup;
    return Promise.all( newAdmins.map( m => helpers.addGroupToUser({ _id : m }, updatedGroup._id) ) )
  })
  .then( updatedUsers => res.send(group) )
  .catch( e => {
    logger.error('Error in addGroupAdmins %j %O %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

logic.createGroup = (req, res) => {
  let createdGroup = {}
  req.body.members.push(req.user._id);
  req.body.adminIds.push(req.user._id);
  const g = new Group({
    "creator" : req.user._id,
    "roles.admins" : uniq(req.body.adminIds),
    "members" : uniq(req.body.members),
    "visibility" : req.body.visibility,
    "name" : req.body.name,
    "description" : req.body.description
  })
  g.save()
  .then( newGroup => {
    createdGroup = newGroup;
    return helpers.addGroupToUser({ _id : req.user._id}, newGroup._id)
  })
  .then( updatedUser => {
    res.send(createdGroup)
  })
  .catch( e => {
    res.status(404);
    logger.error('Error in createGroup %O %O', req.body, e)
    res.send({})
  })
}


logic.deleteGroup = (req, res) => {
  const groupQuery = getQuery(req.body);
  isUserAdminOfGroup(groupQuery, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to delete this group') }
    Group.deleteOne(groupQuery)
    .exec()
    .then( _ => res.send({success : true}) )
  })
  .catch( e => {
    logger.error('Error in deleteGroup body : %O user : %O error : %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}



logic.isUserAdminOfGroup = isUserAdminOfGroup;
logic.findGroup = findGroup;
module.exports = logic;
