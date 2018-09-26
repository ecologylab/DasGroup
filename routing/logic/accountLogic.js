const tokenHandler = require('../../utils/tokenHandler.js')
const authHelper = require('../../utils/authHelper.js')
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const getQuery = require('./getQuery');
const logic = {};

logic.prelog = (req, res) => {
  const decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    const user = decryptedToken.data;
    authHelper.autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.redirect('/')
    }).catch( (e) => {
      logger.error("error in prelog", e)
    })
  } else {
    res.render('error')
  }
}

logic.pseudoLogin = (req, res) => {
  Account.findOne({username : 'avsphere'}).exec()
  .then( (user) =>  {
    authHelper.autoLogin(req, res, user)
    .then( (loggedInUser) => {
      res.send({success:true})
    }).catch( (e) => {
      logger.error("error in prelog", e)
    })
  })
}


logic.getUser = (req, res) => {
  const query = getQuery(req.query);
  Account.findOne(query).exec()
  .then( (user) => {
    if ( !user ) {
      logger.error('A request for a user has failed.', req.query);
      res.status(404);
      user = {};
    }
    res.send(user);
  })
};



module.exports = logic;
