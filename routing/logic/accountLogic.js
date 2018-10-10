const tokenHandler = require('../../utils/tokenHandler.js')
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const helpers = require('../helpers/helpers')
const config = require('config')
const logic = {};



const getQuery = helpers.getQuery;

logic.getUser = (req,res) => {
  const query = getQuery(req.query);
  helpers.findUser(query)
  .then( u => res.send(u) )
  .catch( e => {
    logger.error('Error in getUser %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
}



logic.prelog = (req, res) => {
  const decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    const user = decryptedToken.data.user;
    const redirectTo = decryptedToken.data.redirectTo || '/';
    helpers.findUser({ username : user.username })
    .then( user => {
      req.login(user, (err) => {
        if ( err ) {
          logger.error('Error in prelog - req.login %O %O', user, err)
          throw new Error(err.toString())
        } else {
          res.redirect(redirectTo)
        }
      })
    })
    .catch( e => {
      logger.error("Error in prelog %O, %O", req, e)
      res.render('error')
    })
  }
}




module.exports = logic;
