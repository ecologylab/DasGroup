const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const helpers = require('./helpers/helpers')
require('dotenv').config()
const isAuthenticated = helpers.isAuthenticated;


/* account */
router.get('/getUser', isAuthenticated, accountLogic.getUser);






/* group */
router.get('/getGroups', isAuthenticated, groupLogic.getGroups);
router.get('/getGroupMembers', isAuthenticated, groupLogic.getGroupMembers);

router.post('/addGroupMembers', isAuthenticated, groupLogic.addGroupMembers); //testing before invite
router.post('/addGroupAdmins', isAuthenticated, groupLogic.addGroupAdmins); //testing before invite

router.post('/deleteGroup', isAuthenticated, groupLogic.deleteGroup);
router.post('/createGroup', isAuthenticated, groupLogic.createGroup);

/* buckets */
router.post('/getBuckets')



module.exports = router;
