const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const bucketLogic = require('./logic/bucketLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;


/* account */
router.get('/getUser', isAuthenticated, accountLogic.getUser);
router.get('/getOpenedBuckets', isAuthenticated, accountLogic.getOpenedBuckets)





/* group */
router.get('/getGroups', isAuthenticated, groupLogic.getGroups);
router.get('/getGroupMembers', isAuthenticated, groupLogic.getGroupMembers);

router.post('/joinGroup', isAuthenticated, groupLogic.joinGroup);
router.post('/addGroupAdmins', isAuthenticated, groupLogic.addGroupAdmins);

router.post('/deleteGroup', isAuthenticated, groupLogic.deleteGroup);
router.post('/createGroup', isAuthenticated, groupLogic.createGroup);

/* buckets */
router.post('/createBucket', isAuthenticated, bucketLogic.createBucket);
router.post('/addMacheToBucket', isAuthenticated, bucketLogic.addMacheToBucket);
router.post('/getBuckets', isAuthenticated, bucketLogic.getBuckets)



module.exports = router;
