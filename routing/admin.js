const express = require('express');
const router = express.Router();
const tokenHandler = require('../utils/tokenHandler.js')
const logger = require('../utils/logger');
const adminLogic = require('./logic/adminLogic');
const helpers = require('./helpers/helpers')
const isAuthenticated = helpers.isAuthenticated;

router.get('/:key', isAuthenticated, adminLogic.renderAdmin);

module.exports = router;
