const Account = require('../../models/account')
const Group = require('../../models/group')
const Folio = require('../../models/folio')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
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
  const validate = (folio) => {
    const folioSubmissions = folio.macheSubmissions.map( (m) => m.mache._id.toString() )
    const memberOf = req.user.memberOf.map( (groupId) => groupId.toString() )
    const userMaches = req.user.maches.map( (macheId) => macheId.toString() )
    if ( !memberOf.includes(folio.belongsTo.toString() ) ) { throw new Error('User cannot add maches to folio if they dont belong to group') }
    if ( !userMaches.includes(mache._id.toString() ) ) { throw new Error('User cannot add a mache they are not a part of') }
    if ( folio.state == 'closed' ) { throw new Error('User cannot add mache to closed folio') }
    if ( folioSubmissions.includes(mache._id.toString() ) ) {
      //I want to break out of my promise chain so i am throwing an error, then handling specifically
      res.send(folio);
      sendOnError = false;
      throw new Error('Mache attempted add to folio where it already existed')
    }
    return true;
  }
  findMache(macheQuery)
  .then( m => { mache = m; return findFolio(folioQuery); })
  .then( folio => {
    //validate can only be true or throw an error
    if ( validate(folio) ) {
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
      res.status(404);
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
    if ( !memberOf.includes(folio.belongsTo.toString() ) ) { throw new Error('User cannot remove maches to folio if they dont belong to group') }
    if ( !userMaches.includes(mache._id.toString() ) ) { throw new Error('User cannot remove a mache they are not a part of') }
    if ( folio.state == 'closed' ) { throw new Error('User cannot remove a mache from a closed folio') }
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
      folio.macheSubmissions = folio.macheSubmissions
      .filter( macheSubmission => macheSubmission.mache.toString() != mache._id.toString() );
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
    logger.error('Error in removeMacheFromFolio body : %O user : %O error : %O', req.body, req.user, e)
    if ( sendOnError ) {
      res.status(404);
      res.send({})
    }
  })
}
//req.body = groupQuery : {}, folioQuery : {}
logic.getFolios = (req, res) => {
  const folioQuery = getQuery(req.body.folioQuery);
  const groupQuery = getQuery(req.body.groupQuery);
  findGroup(groupQuery)
  .then( group => {
    const members = group.members.map( m => m.toString() )
    if ( Array.isArray(group) ) { throw new Error('Get folios invalid group query'); }
    if ( members.includes(req.user._id.toString() ) ) { return findFolio(folioQuery); }
    else { throw new Error('User cannot get folios for group they are not a part of'); }
  })
  .then( folios => {
    if ( Array.isArray(folios) ) { res.send(folios); }
    else { res.send([folios]) }
  })
  .catch( (e) => {
    logger.error('Error in getFolios %j %O', req.body, e)
    res.status(404);
    res.send([])
  })
};


// logic.getActiveFolios


//req.body = { groupQuery : { groupId/key : ... }, folioData : {name,description} }
logic.createFolio = (req, res) => {
  const groupQuery = getQuery(req.body.groupQuery);
  let createdFolio, group;
  isUserAdminOfGroup(groupQuery, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to create a folio in this group') }
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
    res.status(404);
    res.send({})
  })
}

logic.deleteFolio = (req, res) => {
  const folioQuery = getQuery(req.body)
  let folioId = '';
  Folio.findOne(folioQuery)
  .exec()
  .then( folio => {
    folioId = folio._id;
    return getQuery({ _id : folio.belongsTo });
  })
  .then( groupQuery => isUserAdminOfGroup(groupQuery, req.user) )
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to delete this folio') }
    Folio.deleteOne(folioQuery)
    .exec()
    .then( _ => res.send({success : true}))
  })
  .catch( e => {
    logger.error('Error in deleteFolio body : %O user : %O error : %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

module.exports = logic;
