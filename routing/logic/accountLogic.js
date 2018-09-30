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
      logger.error('Error in pseduoLogin %j %O', req, e)
      reject(e);
    })
  })
}


logic.getUser = (req, res) => {
  const query = getQuery(req.query);
  Account.findOne(query).exec()
  .then( (user) => {
    res.send(user);
  })
  .catch( e => {
    logger.error('Error in getUser %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
};



module.exports = logic;
