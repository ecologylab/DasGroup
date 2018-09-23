const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const tokenHandler = require('../utils/tokenHandler.js')
const authHelper = require('../utils/authHelper.js')
const Account = require('../models/account')
const Group = require('../models/group')
const logger = require('../utils/logger');
const accountLogic = require('./accountLogic');
const groupLogic = require('./groupLogic');
require('dotenv').config()
const isAuthenticated = process.env.test === 'true' ? (req,res,d) => d() : authHelper.isAuthenticated;


/* account */
router.get('/getUser', isAuthenticated, accountLogic.getUser);






/* group */
router.get('/getGroup', isAuthenticated, groupLogic.getGroup);
router.get('/getGroups', isAuthenticated, groupLogic.getGroups);
router.get('/getGroupMembers', isAuthenticated, groupLogic.getGroupMembers);

router.post('/addGroupMembers', isAuthenticated, groupLogic.addGroupMembers);
router.post('/deleteGroup', isAuthenticated, groupLogic.deleteGroup);
router.post('/createGroup', isAuthenticated, groupLogic.createGroup);





module.exports = router;
