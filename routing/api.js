const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const folioLogic = require('./logic/folioLogic');
const adminLogic = require('./logic/adminLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;

/* account */
router.get('/getUser', isAuthenticated, accountLogic.getUser);
router.get('/getOpenedFolios', isAuthenticated, accountLogic.getOpenedFolios)
router.post('/emailUsers', isAuthenticated, adminLogic.emailUsers)
router.post('/emailSubscribers', isAuthenticated, adminLogic.emailSubscribers)

/* group */
router.get('/getGroups', isAuthenticated, groupLogic.getGroups);
router.get('/getGroupMembers', isAuthenticated, groupLogic.getGroupMembers);
router.post('/getDeepGroup', isAuthenticated, groupLogic.getDeepGroup);

router.post('/joinGroup', isAuthenticated, groupLogic.joinGroup);
router.post('/leaveGroup', isAuthenticated, groupLogic.leaveGroup);

router.post('/promoteToAdmin', isAuthenticated, groupLogic.promoteToAdmin);
router.post('/demoteAdmin', isAuthenticated, groupLogic.demoteAdmin);


router.post('/deleteGroup', isAuthenticated, groupLogic.deleteGroup);
router.post('/createGroup', isAuthenticated, groupLogic.createGroup);

/* folios */
router.post('/createFolio', isAuthenticated, folioLogic.createFolio);
router.post('/updateFolio', isAuthenticated, folioLogic.updateFolio);
router.post('/addMacheToFolio', isAuthenticated, folioLogic.addMacheToFolio);
router.post('/removeMacheFromFolio', isAuthenticated, folioLogic.removeMacheFromFolio);
router.post('/getFolios', isAuthenticated, folioLogic.getFolios)
router.post('/deleteFolio', isAuthenticated, folioLogic.deleteFolio)

module.exports = router;
