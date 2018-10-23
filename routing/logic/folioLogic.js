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


//req.body = { folioQuery : { folioId/key : ... }, macheQuery : { macheId/key : ... }
logic.addMacheToFolio = async (req, res) => {
  const folioQuery = getQuery(req.body.folioQuery);
  const macheQuery = getQuery(req.body.macheQuery);
  try {
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
  const folioQuery = getQuery(req.body.folioQuery);
  const macheQuery = getQuery(req.body.macheQuery);
  try {
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



// logic.removeMacheFromFolio = (req, res) => {
//   let mache = {}, updatedFolio = {}, sendOnError = true;
//   const folioQuery = getQuery(req.body.folioQuery);
//   const macheQuery = getQuery(req.body.macheQuery);
//   const validate = (folio) => {
//     const folioSubmissions = folio.macheSubmissions.map( (m) => m.mache._id.toString() )
//     const memberOf = req.user.memberOf.map( (groupId) => groupId.toString() )
//     const userMaches = req.user.maches.map( (macheId) => macheId.toString() )
//     if ( !memberOf.includes(folio.belongsTo.toString() ) ) { throw new RequestError('User cannot remove maches to folio if they dont belong to group', 1) }
//     if ( !userMaches.includes(mache._id.toString() ) ) { throw new RequestError('User cannot remove a mache they are not a part of', 1) }
//     if ( folio.state == 'closed' ) { throw new RequestError('User cannot remove a mache from a closed folio') }
//     if ( !folioSubmissions.includes(mache._id.toString() ) ) {
//       //I want to break out of my promise chain so i am throwing an error, then handling specifically
//       res.send(folio);
//       sendOnError = false;
//       throw new Error('Cannot remove a mache from a folio if it is not in the folio')
//     }
//     return true;
//   }
//
//   findMache(macheQuery)
//   .then( m => { mache = m; return findFolio(folioQuery); })
//   .then( folio => {
//     //validate can only be true or throw an error
//     if ( validate(folio) ) {
//       const removeIndex = folio.macheSubmissions.map( m => m.mache.toString() ).indexOf(mache._id.toString())
//       folio.macheSubmissions.splice(removeIndex,1);
//       return folio.save()
//     }
//   })
//   .then( savedFolio => {
//     updatedFolio = savedFolio;
//     const updatedMacheMemberOf = mache.memberOfFolios
//     .map( mId => mId.toString() )
//     .filter( mId => mId != mache._id.toString() )
//     mache.memberOfFolios = updatedMacheMemberOf;
//     return mache.save();
//   })
//   .then( savedMache => res.send(updatedFolio) )
//   .catch( e => {
//     if ( e.name === 'VersionError' ) {
//       res.status(202);
//       res.send(req.body)
//     }
//     else if ( sendOnError ) {
//       logger.error('Error in removeMacheFromFolio body : %O user : %O error : %O', req.body, req.user, e)
//       res.status(400);
//       res.send({})
//     }
//   })
// }
// Not protected by userRights folioQuery : {}
logic.getFolios = (req, res) => {
  const folioQuery = getQuery(req.body.folioQuery);
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
  const groupQuery = getQuery(req.body.groupQuery);
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



module.exports = logic;
