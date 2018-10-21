const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const folioLogic = require('./logic/folioLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;

/* account */
router.get('/getUser', isAuthenticated, accountLogic.getUser);
router.get('/getOpenedFolios', isAuthenticated, accountLogic.getOpenedFolios)


/* group */
router.get('/getGroups', isAuthenticated, groupLogic.getGroups);
router.get('/getGroupMembers', isAuthenticated, groupLogic.getGroupMembers);

router.post('/joinGroup', isAuthenticated, groupLogic.joinGroup);
router.post('/leaveGroup', isAuthenticated, groupLogic.leaveGroup);

router.post('/addGroupAdmins', isAuthenticated, groupLogic.addGroupAdmins);
router.post('/addGroupMembers', isAuthenticated, helpers.isNotProd, groupLogic.addGroupMembers);

router.post('/deleteGroup', isAuthenticated, groupLogic.deleteGroup);
router.post('/createGroup', isAuthenticated, groupLogic.createGroup);

/* folios */
router.post('/createFolio', isAuthenticated, folioLogic.createFolio);
router.post('/addMacheToFolio', isAuthenticated, folioLogic.addMacheToFolio);
router.post('/removeMacheFromFolio', isAuthenticated, folioLogic.removeMacheFromFolio);
router.post('/getFolios', isAuthenticated, folioLogic.getFolios)
router.post('/deleteFolio', isAuthenticated, folioLogic.deleteFolio)

module.exports = router;
