const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../utils/tokenHandler.js')
const authHelper = require('../utils/authHelper.js')
const Account = require('../models/account')
const Group = require('../models/group')
const logger = require('../utils/logger');

const logic = {};

const getQueryType = (requestParams) => {
  if ( requestParams.userId ) {
    return { _id : requestParams.userId }
  } else if ( requestParams.username ) {
    return { username : requestParams.username }
  } else if ( requestParams.email ) {
    return { email : requestParams.email }
  } else {
    logger.error('Invalid query type in group logic %j', requestParams);
    throw new Error('Invalid query type in group logic')
  }
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

logic.pseudoLogin = (req, res) => {
  Account.findOne({username : 'avsphere'}).exec()
  .then( (user) =>  {
    authHelper.autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.send({success:true})
    }).catch( (e) => {
      logger.error("error in prelog", e)
    })
  })
}


logic.getUser = (req, res) => {
  let queryType = getQueryType(req.query);
  Account.findOne(queryType).exec()
  .then( (user) => {
    if ( !user ) {
      logger.error('A request for a user has failed.', req.query);
      res.status(404);
    }
    res.send(user);
  })
};



module.exports = logic;
