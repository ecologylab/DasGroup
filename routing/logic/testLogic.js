const Account = require('../../models/account')
const Group = require('../../models/group')
const Mache = require('../../models/mache')
const Folio = require('../../models/folio')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max))
const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findFolio = helpers.findFolio;
const findGroup = helpers.findGroup;
const findMache = helpers.findMache;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;



logic.addMachesToFolios = async (req, res) => {
  try {
    await addMacheToFolioShotgun(req.body)
    res.send({success  : true})
  }
  catch (error) {
    console.error(error);
    res.send(error);
  }
}

module.exports = logic;
