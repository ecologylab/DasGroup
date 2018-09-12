const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../utils/tokenHandler.js')
const authHelper = require('../utils/authHelper.js')
const Account = require('../models/account')
const Group = require('../models/group')


const isAuthenticated = authHelper.isAuthenticated;
router.get('/prelog/:token', (req, res) => {
  let decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    let user = decryptedToken.data;
    authHelper.autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.redirect('/')
    }).catch( (e) => {
      console.log("error in prelog", e)
    })
  } else {
    res.render('error')
  }
})

router.get('/', isAuthenticated, (req, res) => {
  res.render('index', {user : req.user})
})

router.post('/getUser', isAuthenticated, (req, res) => {
  Account.findById(req.body.userId, (err, user) => {
    res.send({user : user})
  })
})

router.post('/getGroup', isAuthenticated, (req, res) => {
  Group.findById(req.body.groupId, (err, group) => {
    res.send({group : group})
  })
})

router.get('/postLogin', isAuthenticated, (req, res) => {
  res.render('postLogin', {title : 'Home'})
})

router.get('/getToken', isAuthenticated, (req, res) => {
  let token = tokenHandler.generateToken(req.user),
      redirectUrl = 'https://localhost:5000/prelog/' + token;
  res.redirect(redirectUrl)
})





module.exports = router;
