const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../utils/tokenHandler.js')
const authHelper = require('../utils/authHelper.js')
const Account = require('../models/account')
const Group = require('../models/group')
const logger = require('../utils/logger');
require('dotenv').config()
const logic = {};


const getQueryType = (requestParams) => {
  if ( requestParams.groupId ) {
    return { _id : requestParams.groupId }
  } else if ( requestParams.groupKey ) {
    return { key : requestParams.groupKey }
  } else {
    logger.error('Invalid query type in group logic %j', requestParams);
    throw new Error('Invalid query type in group logic')
  }
}


const findGroup = (queryType) => {
  return new Promise( (resolve, reject) => {
    Group.findOne(queryType).exec()
    .then( (group) => {
      if ( !group ) { reject('No group found'); }
      resolve(group);
    })
    .catch( e => {
      logger.error('Error in findGroup  %j', req.query, {err : e})
      reject(e);
    })
  })
}


logic.getGroup = (req, res) => {
  let queryType = getQueryType(req.query);
  findGroup(queryType)
  .then( group => res.send(group) )
  .catch( (e) => {
    logger.error('Error in getGroup  %j', req.query, {err : e})
    res.status(404);
    res.send({})
  })
};

logic.getGroupMembers = (req, res) => {
  let queryType = getQueryType(req.query);
  findGroup(queryType)
  .then( group => group.getGroupMembers() )
  .then( members => res.send(members) )
  .catch( (e) => {
    logger.error('Error in getGroupMembers %j', req.query,{err : e} )
    res.status(404);
    res.send({})
  })
}


logic.createGroup = (req, res) => {
  const g = new Group({
    creator : req.body.creatorId,
    admins : req.body.adminIds,
    members : req.body.members,
    visibility : req.body.visibility,
    name : req.body.name,
    description : req.body.description
  })
  g.save()
  .then( newGroup => {
    res.send(newGroup)
  })
  .catch( e => {
    res.status(404);
    logger.error('Error in createGroup %O %O', req.body, {err : e})
    res.send({})
  })
}

logic.deleteGroup = (req, res) => {
  let query = getQueryType(req.body);
  findGroup(query)
  .then( group => {
    if (  process.env.test === 'true' || group.admins.includes(req.user._id) ) {
      logger.notice("Allowing user to delete group! %O", group)
      Group.remove(query).exec()
      .then( res.send({success : true}))
    } else {
      throw new Error("user is not authorized to delete group")
    }
  })
  .catch( e => {
    res.status(404);
    logger.error('Error in deleteGroup %O %O', req.body, {err : e})
    res.send({})
  })
}





module.exports = logic;
