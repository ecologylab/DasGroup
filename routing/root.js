const express = require('express');
const router = express.Router();
const authHelper = require('../utils/authHelper.js')
const accountLogic = require('./logic/accountLogic');
require('dotenv').config()
const isAuthenticated = process.env.test === 'true' ? (req,res,d) => d() : authHelper.isAuthenticated;


/* token */
router.get('/prelog/:token', accountLogic.prelog);

router.get('/', isAuthenticated, (req, res) => {
  res.render('index', {user : req.user})
})

router.get('/api', isAuthenticated, (req, res) => {
  res.render('api', {user : req.user})
})






module.exports = router;
