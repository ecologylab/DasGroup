const express = require('express');
const router = express.Router();
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const folioLogic = require('./logic/folioLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;


/* token */


router.get('/', isAuthenticated, groupLogic.renderRoot);
router.get('/group/:key', isAuthenticated, groupLogic.renderGroup);
router.get('/test', isAuthenticated, groupLogic.renderRoot);
router.get('/folio/:id', isAuthenticated, folioLogic.renderFolio);
router.get('/newfolio/:key', isAuthenticated, folioLogic.newFolio);
router.get('/newgroup', isAuthenticated, (req, res) => {
  res.render('newgroup', {user : req.user})
})

router.get('/api', isAuthenticated, (req, res) => {
  res.render('api', {user : req.user})
})







module.exports = router;
