const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const folioLogic = require('./logic/folioLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;


const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max))


router.post('/testRetry', (req, res) => {
  if ( getRandomInt(3) !== 2 ) {
    res.status(202);
    res.send({})

  } else {
    res.send({success : true, data : req.body })
  }
})


router.get('/sessTest', (req,res) => {
  redisClient.get(`sess:${req.session.id}`, (err, reply) => {
    console.log("reply ", reply)
    res.send(reply)
  })
})

module.exports = router;
