const express = require('express');
const router = express.Router();
const accountLogic = require('./logic/accountLogic');
const groupLogic = require('./logic/groupLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;


/* token */


router.get('/', isAuthenticated, groupLogic.renderRoot);
router.get('/group/:key', isAuthenticated, groupLogic.renderGroup);
router.get('/test', isAuthenticated, groupLogic.renderRoot);

router.get('/api', isAuthenticated, (req, res) => {
  res.render('api', {user : req.user})
})







module.exports = router;
