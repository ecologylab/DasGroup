const Account = require('../../models/account')
const Group = require('../../models/group')
const Mache = require('../../models/mache')
const Folio = require('../../models/folio')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const uniq = helpers.uniq;
const getQuery = helpers.getQuery;
const findFolio = helpers.findFolio;
const findGroup = helpers.findGroup;
const findMache = helpers.findMache;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;


//req.body = { folioQuery : { folioId/key : ... }, macheQuery : { macheId/key : ... }
logic.addMacheToFolio = (req, res) => {
  let mache = {}, updatedFolio = {}, sendOnError = true;
  const folioQuery = getQuery(req.body.folioQuery);
  const macheQuery = getQuery(req.body.macheQuery);
  const validate = (folio, mache) => {
    const folioSubmissions = folio.macheSubmissions.map( (m) => m.mache._id.toString() )
    const memberOf = req.user.memberOf.map( (groupId) => groupId.toString() )
    //(models/mache.js) => user : [{ user : id, role : role, roleNum : int }]
    const usersWhoCanEdit =  Array.from(mache.users.filter( u => u.roleNum == 1).map( u => u.user.toString() ) );
    usersWhoCanEdit.push(mache.creator.toString() )
    if ( !memberOf.includes(folio.belongsTo.toString() ) ) { throw new RequestError('User cannot add maches to folio if they dont belong to group', 1) }
    if ( !usersWhoCanEdit.includes(req.user._id.toString() ) ) { throw new RequestError('User cannot add a mache they are not an editor of', 1) }
    if ( folio.state == 'closed' ) { throw new RequestError('User cannot add mache to closed folio') }
    if ( folioSubmissions.includes(mache._id.toString() ) ) {
      //I want to break out of my promise chain so i am throwing an error, then handling specifically
      res.send(folio);
      sendOnError = false;
      throw new RequestError('Mache attempted add to folio where it already existed')
    }
    return true;
  }
  findMache(macheQuery)
  .then( m => { mache = m; return findFolio(folioQuery); })
  .then( folio => {
    //validate can only be true or throw an error
    if ( validate(folio, mache) ) {
      folio.macheSubmissions.push({
        mache : mache._id,
        submitter : req.user._id,
        date_submitted : Date.now()
      })
      return folio.save()
    }
  })
  .then( savedFolio => {
    updatedFolio = savedFolio;
    mache.memberOfFolios.push(savedFolio._id)
    return mache.save();
  })
  .then( savedMache => res.send(updatedFolio) )
  .catch( e => {
    logger.error('Error in addMachesToFolio body : %O user : %O error : %O', req.body, req.user, e)
    if ( sendOnError ) {
      res.status(400);
      res.send({})
    }
  })
}

logic.removeMacheFromFolio = (req, res) => {
  let mache = {}, updatedFolio = {}, sendOnError = true;
  const folioQuery = getQuery(req.body.folioQuery);
  const macheQuery = getQuery(req.body.macheQuery);
  const validate = (folio) => {
    const folioSubmissions = folio.macheSubmissions.map( (m) => m.mache._id.toString() )
    const memberOf = req.user.memberOf.map( (groupId) => groupId.toString() )
    const userMaches = req.user.maches.map( (macheId) => macheId.toString() )
    if ( !memberOf.includes(folio.belongsTo.toString() ) ) { throw new RequestError('User cannot remove maches to folio if they dont belong to group', 1) }
    if ( !userMaches.includes(mache._id.toString() ) ) { throw new RequestError('User cannot remove a mache they are not a part of', 1) }
    if ( folio.state == 'closed' ) { throw new RequestError('User cannot remove a mache from a closed folio') }
    if ( !folioSubmissions.includes(mache._id.toString() ) ) {
      //I want to break out of my promise chain so i am throwing an error, then handling specifically
      res.send(folio);
      sendOnError = false;
      throw new Error('Cannot remove a mache from a folio if it is not in the folio')
    }
    return true;
  }

  findMache(macheQuery)
  .then( m => { mache = m; return findFolio(folioQuery); })
  .then( folio => {
    //validate can only be true or throw an error
    if ( validate(folio) ) {
      const removeIndex = folio.macheSubmissions.map( m => m.mache.toString() ).indexOf(mache._id.toString())
      folio.macheSubmissions.splice(removeIndex,1);
      return folio.save()
    }
  })
  .then( savedFolio => {
    updatedFolio = savedFolio;
    const updatedMacheMemberOf = mache.memberOfFolios
    .map( mId => mId.toString() )
    .filter( mId => mId != mache._id.toString() )
    mache.memberOfFolios = updatedMacheMemberOf;
    return mache.save();
  })
  .then( savedMache => res.send(updatedFolio) )
  .catch( e => {
    if ( e.name === 'VersionError' ) {
      res.status(202);
      res.send(req.body)
    }
    else if ( sendOnError ) {
      logger.error('Error in removeMacheFromFolio body : %O user : %O error : %O', req.body, req.user, e)
      res.status(400);
      res.send({})
    }
  })
}
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

logic.deleteFolio = (req, res) => {
  const folioQuery = getQuery(req.body)
  let folio;
  Folio.findOne(folioQuery)
  .exec()
  .then( folioDoc => {
    folio = folioDoc;
    return getQuery({ groupId : folio.belongsTo });
  })
  .then( groupQuery => isUserAdminOfGroup(groupQuery, req.user) )
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to delete this folio') }
    return folio.pseudoRemove()
  })
  .then( _ => res.send({success : true}))
  .catch( e => {
    logger.error('Error in deleteFolio body : %O user : %O error : %O', req.body, req.user, e)
    res.status(400);
    res.send({})
  })
}



module.exports = logic;
