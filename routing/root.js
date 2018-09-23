const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const authHelper = require('../utils/authHelper.js')
const accountLogic = require('./accountLogic');
require('dotenv').config()
const isAuthenticated = process.env.test === 'true' ? (req,res,d) => d() : authHelper.isAuthenticated;


/* token */
router.get('/prelog/:token', accountLogic.prelog);
router.get('/pseudoLogin', accountLogic.pseudoLogin);

router.get('/', isAuthenticated, (req, res) => {
  res.render('index', {user : req.user})
})

router.get('/api', isAuthenticated, (req, res) => {
  res.render('api', {user : req.user})
})






module.exports = router;
