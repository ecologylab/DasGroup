const Account = require('../../models/account')
const Group = require('../../models/group')
const Mache = require('../../models/mache')
const Folio = require('../../models/folio')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findFolio = helpers.findFolio;
const findGroup = helpers.findGroup;
const findMache = helpers.findMache;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;


//req.body = { folioLocator : { folioId/key : ... }, macheLocator : { macheId/key : ... }
logic.addMacheToFolio = async (req, res) => {
  try {
    const folioQuery = getQuery(req.body.folioLocator);
    const macheQuery = getQuery(req.body.macheLocator);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Folio.findOne(folioQuery).exec() );
        promises.push( Mache.findOne(macheQuery).exec() );
        Promise.all(promises)
        .then( ([ folio, mache ]) => {
          collection.folio = folio;
          collection.mache = mache;
          resolve(collection);
        })
        .catch(e => {
          logger.error('Error in addMacheToFolio collect')
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const folioAndMacheExist = () => {
          let successStatus = true;
          if ( !collection.folio || !collection.mache ) {
            errorMessage = 'folio or mache does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const userCanEdit = () => {
          let successStatus = true;
          const usersWhoCanEdit = collection.mache.users.filter( u => u.roleNum == 1).map( u => u.user.toString() );
          usersWhoCanEdit.push(collection.mache.creator)
          if ( usersWhoCanEdit.includes(req.user._id.toString() ) ) {
            errorMessage = 'User cannot add mache to folio if they are not part of the mache';
            console.log(`addMacheToFolio: User trying to add mache ${req.user}. Users allowed to add ${userCanEdit}`)
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.folio.belongsTo) === -1) {
            errorMessage = 'User cannot add mache to folio if they do not belong to group';
            successStatus = false;
          }
          //FIX ME -- inconsistent
          return true;
        }
        const folioIsOpen = () => {
          let successStatus = true;
          if ( collection.folio.state !== 'opened') {
            errorMessage = 'User cannot add mache to closed folio';
            successStatus = false;
          }
          return successStatus;
        }
        const folioDoesNotAlreadyIncludeMache = () => {
          let successStatus = true;
          if ( collection.folio.macheSubmissions.indexOf(collection.mache._id) !== -1) {
            errorMessage = 'Folio already includes mache';
            successStatus = false;
          }
          return successStatus;
        }
        if ( folioAndMacheExist() && userCanEdit() && folioIsOpen() && folioDoesNotAlreadyIncludeMache() ) {
          resolve(true);
        } else {
          logger.error("addMacheToFolio validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('folio', 'mache');
    const validated = await validate(collection);

    collection.folio.macheSubmissions.push({
      mache : collection.mache._id,
      submitter : req.user._id,
      date_submitted : Date.now()
    })
    collection.mache.memberOfFolios.push(collection.folio._id)

    Promise.all( [collection.folio.save(), collection.mache.save()] )
    .then( ([savedFolio, savedMache]) => {
      res.send(savedFolio);
    })
    .catch( e => {
      logger.error('Error in addMacheToFolio saves')
      throw e;
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in addMacheToFolio %j %O', req.body, err)
    res.send([])
  }

}

//req.body = { folioQuery : { folioId/key : ... }, macheQuery : { macheId/key : ... }
logic.removeMacheFromFolio = async (req, res) => {
  try {
    const folioQuery = getQuery(req.body.folioLocator);
    const macheQuery = getQuery(req.body.macheLocator);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Folio.findOne(folioQuery).exec() );
        promises.push( Mache.findOne(macheQuery).exec() );
        Promise.all(promises)
        .then( ([ folio, mache ]) => {
          collection.folio = folio;
          collection.mache = mache;
          resolve(collection);
        })
        .catch(e => {
          logger.error('Error in removeMacheFromFolio collect')
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const folioAndMacheExist = () => {
          let successStatus = true;
          if ( !collection.folio || !collection.mache ) {
            errorMessage = 'folio or mache does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const userCanEdit = () => {
          let successStatus = true;
          const usersWhoCanEdit = collection.mache.users.filter( u => u.roleNum == 1).map( u => u.user.toString() );
          usersWhoCanEdit.push(collection.mache.creator)
          if ( usersWhoCanEdit.includes(req.user._id.toString() ) ) {
            errorMessage = 'User cannot add mache to folio if they are not part of the mache';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.folio.belongsTo) === -1) {
            errorMessage = 'User cannot add mache to folio if they do not belong to group';
            successStatus = false;
          }

          return successStatus;
        }
        const folioIsOpen = () => {
          let successStatus = true;
          if ( collection.folio.state !== 'opened') {
            errorMessage = 'User cannot remove mache from closed folio';
            successStatus = false;
          }
          return successStatus;
        }
        const folioIncludesMache = () => {
          let successStatus = true;
          const macheSubmissions = collection.folio.macheSubmissions.map( sub => sub._id.toString() );
          if ( macheSubmissions.includes(collection.mache._id.toString() ) === -1) {
            errorMessage = 'Folio does not include mache';
            successStatus = false;
          }
          return successStatus;
        }
        if ( folioAndMacheExist() && userCanEdit() && folioIsOpen() && folioIncludesMache() ) {
          resolve(true);
        } else {
          logger.error("removeMacheFromFolio validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('folio', 'mache');
    const validated = await validate(collection);
    const macheSubmissions = collection.folio.macheSubmissions.map( sub => sub._id.toString() );
    const submissionIndex = macheSubmissions.indexOf(collection.mache._id.toString());
    const memberOfIndex = collection.mache.memberOfFolios.indexOf(collection.folio._id);

    collection.folio.macheSubmissions.splice(submissionIndex, 1);
    collection.mache.memberOfFolios.splice(memberOfIndex, 1);

    Promise.all( [collection.folio.save(), collection.mache.save()] )
    .then( ([savedFolio, savedMache]) => {
      res.send(savedFolio);
    })
    .catch( e => {
      if ( e.name === 'VersionError' ) {
        res.status(202);
        res.send(req.body)
      }
      else { throw e; }
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in removeMacheFromFolio %j %O', req.body, err)
    res.send([])
  }

}

logic.updateFolio = async (req, res) => {
  try {
    const folioQuery = getQuery(req.body.folioLocator);
    const folioData = req.body.folioData;
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Folio.findOne(folioQuery)
        .exec()
        .then( folio => {
          collection.folio = folio;
          return Group.findOne( getQuery({ groupId : folio.belongsTo }) ).exec()
        })
        .then( group => {
          collection.group = group;
          resolve(collection);
        })
        .catch( e => {
          logger.error("updateFolio collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const folioAndGroupExists = () => {
          let successStatus = true;
          if ( !collection.folio && !collection.group ) {
            errorMessage = 'folio or group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const updatingUserisAdmin = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have updating user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'updating user is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'Group does not have updating user as admin';
            successStatus = false;
          }
          return successStatus;
        }

        if ( folioAndGroupExists() && updatingUserisAdmin() ) {
          resolve(true);
        } else {
          logger.error("deleteGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('folio', 'group');
    const validated = await validate(collection);

    if ( folioData.hasOwnProperty('name') ) {
      collection.folio.name = folioData.name;
    }
    if ( folioData.hasOwnProperty('description') ) {
      collection.folio.description = folioData.description;
    }
    if ( folioData.hasOwnProperty('visibility') ) {
      collection.folio.visibility = folioData.visibility;
    }
    if ( folioData.hasOwnProperty('transparent') ) {
      collection.folio.transparent = folioData.transparent;
    }
    if ( folioData.hasOwnProperty('state') ) {
      collection.folio.state = folioData.state;
    }
    if ( folioData.hasOwnProperty('permissionSettings') ) {
      collection.folio.permissionSettings = folioData.permissionSettings;
    }

    let updatedFolio = await collection.folio.save();

    res.send(updatedFolio);
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in updateFolio %j %O', req.body, err)
    res.send([])
  }

}

// Not protected by userRights folioQuery : {}
logic.getFolios = (req, res) => {
  const folioQuery = getQuery(req.body.folioLocator);
  findFolio(folioQuery)
  .then( folios => {
    if ( Array.isArray(folios) ) { res.send(folios); }
    else { res.send([folios]) }
  })
  .catch( e => {
    logger.error('Error in getFolios by folioQuery %j %O', req.body, e)
    res.status(400);
    res.send([])
  })
};



//req.body = { groupQuery : { groupId/key : ... }, folioData : {name,description} }
logic.createFolio = (req, res) => {
  const groupQuery = getQuery(req.body.groupLocator);
  let createdFolio, group;
  isUserAdminOfGroup(groupQuery, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new RequestError('User is not authorized to create a folio in this group',1) }
    group = adminStatus.group;
    const b = new Folio({
      "creator" : req.user._id,
      "belongsTo" : group._id,
      "name" : req.body.folioData.name,
      "visibility" : req.body.folioData.visibility,
      "state" : req.body.folioData.state,
      "description" : req.body.folioData.description
    })
    return b.save();
  })
  .then(savedFolio => {
    createdFolio = savedFolio;
    return helpers.addFolioToGroup(groupQuery, createdFolio._id)
  })
  .then( updatedGroup => {
    res.send(createdFolio);
  })
  .catch( e => {
    logger.error('Error in createFolio body : %O user : %O error : %O', req.body, req.user, e)
    res.status(400);
    res.send({})
  })
}


logic.deleteFolio = async (req, res) => {
  try {
    const folioQuery = getQuery(req.body);
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Folio.findOne(folioQuery)
        .exec()
        .then( folio => {
          collection.folio = folio;
          return Group.findOne( getQuery({ groupId : folio.belongsTo }) ).exec()
        })
        .then( group => {
          collection.group = group;
          resolve(collection);
        })
        .catch( e => {
          logger.error("deleteFolio collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        let errorMessage = '';
        const folioAndGroupExists = () => {
          let successStatus = true;
          if ( !collection.folio && !collection.group ) {
            errorMessage = 'folio or group does not exist';
            res.status(412);
            successStatus = false;
          }
          return successStatus;
        }
        const deletingUserIsAdmin = () => {
          let successStatus = true;
          if ( collection.group.members.indexOf(req.user._id) === -1) {
            errorMessage = 'Group does not have deleting user as member';
            successStatus = false;
          }
          if ( req.user.memberOf.indexOf(collection.group._id) === -1) {
            errorMessage = 'deleting user is not a member of this group';
            successStatus = false;
          }
          if ( !collection.group.isUserAdmin(req.user) ) {
            errorMessage = 'Group does not have deleting user as admin';
            successStatus = false;
          }
          return successStatus;
        }

        if ( folioAndGroupExists() && deletingUserIsAdmin() ) {
          resolve(true);
        } else {
          logger.error("deleteGroup validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('folio', 'group');
    const validated = await validate(collection);
    collection.folio.pseudoRemove()
    .then( res.send({success : true}) )
    .catch( e => {
      logger.error('Error in deleteFolio remove')
      throw e;
    })
  } catch (err) {
    if ( res.statusCode === 200 ) { res.status(404) }
    logger.error('Error in deleteFolio %j %O', req.body, err)
    res.send([])
  }
}

logic.renderFolio = async (req, res) => {
  try {
    const query = getQuery({folioId : req.params.id})
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Folio.findOne(query)
        //.populate('belongsTo', 'name')
        .populate('macheSubmissions', 'mache date_submitted')
        .exec()
        .then( folio => {
          collection.folio = folio;
          resolve(collection)
        })
        .catch( e => {
          logger.error("renderFolio collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      let errorMessage = '';
      return new Promise( (resolve, reject) => {
        const folioExists = () => {
          let successStatus = true;
          if ( !collection.folio ) {
            errorMessage = 'folio does not exist'
            successStatus = false;
          }
          return successStatus;
        }
        if ( folioExists() ) {
          resolve(true);
        } else {
          logger.error("renderFolio validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('folio');
    const validated = await validate(collection);
    const renderData = {
      user :  req.user,
      folio : collection.folio,
    }
    req.user.currentFolio = collection.folio;
    res.render('folio', renderData)
  } catch ( err ) {
    logger.error('Error in renderFolio %j %O', req.query, err)
    res.status(404);
    res.redirect('/')
  }
}

logic.newFolio = async (req, res) => {
  try {
    const query = getQuery({groupKey : req.params.key})
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection)
        })
        .catch( e => {
          logger.error("newFolio collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      let errorMessage = '';
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist'
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() ) {
          resolve(true);
        } else {
          logger.error("renderGroup validate error")
          reject(`validateError ${errorMessage}`)
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
    res.render('newFolio', renderData)
  } catch ( err ) {
    logger.error('Error in newFolio %j %O', req.query, err)
    res.status(404);
    res.redirect('/')
  }
}

module.exports = logic;
