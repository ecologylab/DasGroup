const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../tokenHandler.js')
const Account = require('../models/account')
function isAuthenticated(req, res, next) {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    res.redirect('https://localhost:5000/');
  }
}
function getUser(userInfo) {
  return new Promise( (resolve, reject) => {
    Account.findOne( {username : userInfo.username}, (err, foundUser) => {
      if ( err ) { reject(err); }
      else if ( !foundUser ) {
        reject("No user")
      } else {
        resolve(foundUser);
      }
    })
  })
}

function autoLogin(req, res, userInfo) {
  return new Promise( (resolve, reject) => {
    getUser(userInfo).then( user => {
      if (!user) { reject("No user found in autologin") }
      req.login(user, (err) => {
        if (err) { reject(err); }
        resolve(user);
      })
    })
  })
}

router.get('/prelog/:token', (req, res) => {
  let decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    let user = decryptedToken.data;
    autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.redirect('/')
    }).catch( (e) => {
      console.log("error in prelog", e)
    })
  } else {
    res.render('noJwt')
  }
})

router.get('/', isAuthenticated, (req, res) => {
  console.log("/", req.user);
  res.render('index', {title : 'Home'})
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
