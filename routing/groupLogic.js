const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../utils/tokenHandler.js')
const authHelper = require('../utils/authHelper.js')
const Account = require('../models/account')
const Group = require('../models/group')
const logger = require('../utils/logger');
const getQuery = require('./getQuery');
require('dotenv').config()
const logic = {};

const uniq = (a) => Array.from(new Set(a));



const findGroup = (query) => {
  return new Promise( (resolve, reject) => {
    Group.find(query).exec()
    .then( (group) => {
      if ( group.length === 1 ) { resolve(group[0]) }
      resolve(group);
    })
    .catch( e => {
      logger.error('Error in findGroup %j %O', query, e)
      reject(e);
    })
  })
}




logic.getGroup = (req, res) => {
  let query = getQuery(req.query);
  findGroup(query)
  .then( group => res.send(group) )
  .catch( (e) => {
    logger.error('Error in getGroup %j %O', req.query, e)
    res.status(404);
    res.send({})
  })
};

//This getGroups differs from the Account model method in that it takes a list of groupIds where the account model expects a user
logic.getGroups = (req, res) => {
  let query = getQuery(req.query);
  findGroup(query)
  .then( group => res.send(group) )
  .catch( (e) => {
    logger.error('Error in getGroups %j %O', req.query, e)
    res.status(404);
    res.send({})
  })
};

logic.getGroupMembers = (req, res) => {
  let query = getQuery(req.query);
  findGroup(query)
  .then( group => group.getGroupMembers(Account) )
  .then( members => res.send(members) )
  .catch( (e) => {
    logger.error('Error in getGroupMembers %j %O', req.query, e)
    res.status(404);
    res.send({})
  })
}
//takes a group then member(s)
logic.addGroupMembers = (req, res) => {
  console.log(req.query);
  res.send({});
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
  let query = getQuery(req.body);
  findGroup(query)
  .then( group => {
    req.user.getAdminOf().then( adminList => console.log("ADMIN LIST", adminList))
    if (  process.env.test === 'true' || group.roles.admins.includes(req.user._id) ) {
      logger.notice("Allowing user to delete group! %O", group)
      Group.deleteOne(query).exec()
      .then( res.send({success : true}))
    } else {
      throw new Error('User is not authorized to delete this group')
    }
  })
  .catch( e => {
    res.status(404);
    logger.error('Error in deleteGroup %O %O', req.body, e)
    res.send({})
  })
}





module.exports = logic;
