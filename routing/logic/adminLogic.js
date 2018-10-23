const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findGroup = helpers.findGroup;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;

logic.renderAdmin = async (req, res) => {
  try {
    const query = getQuery({groupKey : req.params.key})
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .populate('members', 'username')
        .populate('roles.admins', 'username')
        .populate('folios', 'name state visibility macheSubmissions')
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection)
        })
        .catch( e => {
          logger.error("renderGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() ) {
          resolve(true);
        } else {
          logger.error("renderAdmin validate error")
          reject('validateError - group does not exist')
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);
    const renderData = {
      user :  req.user,
      group : collection.group,
    }
    req.user.currentGroup = collection.group;
    res.render('admin', renderData)
  } catch ( err ) {
    logger.error('Error in renderAdmin %j %O', req.query, err)
    res.status(404);
    res.send([])
  }
}

module.exports = logic;
