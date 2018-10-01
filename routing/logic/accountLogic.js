const tokenHandler = require('../../utils/tokenHandler.js')
const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const helpers = require('../helpers/helpers')
const logic = {};






logic.prelog = (req, res) => {
  const decryptedToken = tokenHandler.decryptToken(req.params.token);
  if ( decryptedToken ) {
    const user = decryptedToken.data;
    helpers.findUser({ username : user.username })
    .then( user => {
      req.login(user, (err) => {
        if ( err ) {
          logger.error('Error in prelog - req.login %O %O', user, err)
          throw new Error(err.toString())
        } else {
          res.redirect('/')
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
