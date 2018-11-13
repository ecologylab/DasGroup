const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const folioLogic = require('./logic/folioLogic');
const testLogic = require('./logic/testLogic');
const helpers = require('./helpers/helpers')
const config = require('config')
const mailer = require('../utils/mailer.js')
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

router.post('/removeGroupMembers', isAuthenticated, helpers.isNotProd, groupLogic.removeGroupMembers);
router.post('/addGroupMembers', isAuthenticated, helpers.isNotProd, groupLogic.addGroupMembers);

router.post('/addMachesToFolios', helpers.isNotProd, testLogic.addMachesToFolios);


router.post('/joinGroupTest', isAuthenticated, () => {});
router.get('/sessTest', (req,res) => {
  redisClient.get(`sess:${req.session.id}`, (err, reply) => {
    console.log("reply ", reply)
    res.send(reply)
  })
})

router.get('/mail', helpers.isNotProd, (req,res) => {
  mailer.sendMail({
    from: config.nodemailer.username,
    to : req.query.to,
    subject : 'Hi this is Monica, looking for a good time?',
    html : `<p> ;) ${ getRandomInt(100) } `
  })
  .then( res.send(true) )
  .catch( e => res.send(e) )
})


module.exports = router;
