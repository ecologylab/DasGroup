const authHelper = require('../../utils/authHelper.js')
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const getQuery = require('./getQuery');
require('dotenv').config()
const logic = {};

const uniq = (a) => Array.from(new Set(a));



const findGroup = (query) => {
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

const isUserAdminOfGroup = (groupQuery, user) => {
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
//takes a groupId/key -- only updates passed fields -- admins and buckets handled seperately
logic.updateGroup = (req, res) => {
  const query = getQuery(req.query);
  isUserAdminOfGroup(query, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to delete this group') }
    const group = adminStatus.group;
    if ( req.body.hasOwnProperty('members') ) {
      group.members = req.body.members;
    }
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
    logger.error('Error in updateGroup %j %O', req.query, e)
    res.status(404);
    res.send({})
  })
}


logic.createGroup = (req, res) => {
  if (  process.env.test === 'true' || req.body.creatorId === req.user._id ) {
    req.body.members.push(req.body.creatorId);
    const g = new Group({
      "creator" : req.body.creatorId,
      "roles.admins" : uniq(req.body.adminIds),
      "members" : uniq(req.body.members),
      "visibility" : req.body.visibility,
      "name" : req.body.name,
      "description" : req.body.description
    })
    g.save()
    .then( newGroup => {
      res.send(newGroup)
    })
    .catch( e => {
      res.status(404);
      logger.error('Error in createGroup %O %O', req.body, e)
      res.send({})
    })
  } else {
    res.status(404);
    logger.error('Error in createGroup - creating user does not match creatorId %O %O', req.body, e)
    res.send({})
  }
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
