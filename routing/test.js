const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const delay = require('../utils/delay');
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
  for ( let i = 0; i < 5; i++ ) {
    mailer.sendMail({
      from: 'livemache@ecologylab.net',
      to : 'nic@ecologylab.net', //'nic@ecologylab.net'
      subject : `Test ${i} of 9999`,
      html : `<p>  ${ getRandomInt(100)} </p> `
    })
    delay(i*i*2000)
  }
  // mailer.sendMail({
  //   from: 'livemache@ecologylab.net',
  //   to : 'nic@ecologylab.net', //'nic@ecologylab.net'
  //   subject : `Test ${i} of 9999`,
  //   html : `<p>  ${ getRandomInt(100)} </p> `
  // })
  res.send(true)
  // .then( res.send(true) )
  // .catch( e => {
  //   console.log("MAIL ERROR", e)
  //   res.send(e)
  //
  // })
})


module.exports = router;
