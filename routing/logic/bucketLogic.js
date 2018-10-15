const Account = require('../../models/account')
const Group = require('../../models/group')
const Bucket = require('../../models/bucket')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
const logic = {};

const uniq = helpers.uniq;
const getQuery = helpers.getQuery;
const findBucket = helpers.findBucket;
const findGroup = helpers.findGroup;
const findMache = helpers.findMache;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;


//req.body = { bucketQuery : { bucketId/key : ... }, macheQuery : { macheId/key : ... }
//FIX ME check that user owns mache when mache model is in
logic.addMacheToBucket = (req, res) => {
  const bucketQuery = getQuery(req.body.bucketQuery);
  const macheQuery = getQuery(req.body.macheQuery);
  let mache = {}, updatedBucket = {}, sendOnError = true;
  findMache(macheQuery)
  .then( m => { mache = m; return findBucket(bucketQuery); })
  .then( bucket => {
    const bucketSubmissions = bucket.macheSubmissions.map( (m) => m.mache._id.toString() )
    const memberOf = req.user.memberOf.map( (groupId) => groupId.toString() )
    const userMaches = req.user.maches.map( (macheId) => macheId.toString() )
    if ( !memberOf.includes(bucket.belongsTo.toString() ) ) { throw new Error('User cannot add maches to bucket if they dont belong to group') }
    if ( !userMaches.includes(mache._id.toString() ) ) { throw new Error('User cannot add a mache they are not a part of') }
    if ( bucket.state == 'closed' ) { throw new Error('User cannot add mache to closed bucket') }
    if ( bucketSubmissions.includes(mache._id.toString() ) ) {
      //In this case  I want to break out of my promise chain so i am throwing an error, then handling specifically
      res.send(bucket);
      sendOnError = false;
      throw new Error('Mache attempted add to bucket where it already existed')
    } else {
      bucket.macheSubmissions.push({
        mache : mache._id,
        submitter : req.user._id,
        date_submitted : Date.now()
      })
      return bucket.save()
    }
  })
  .then( savedBucket => {
    updatedBucket = savedBucket;
    mache.memberOfBuckets.push(savedBucket._id)
    return mache.save();
  })
  .then( savedMache => res.send(updatedBucket) )
  .catch( e => {
    logger.error('Error in addMachesToBucket body : %O user : %O error : %O', req.body, req.user, e)
    if ( sendOnError ) {
      res.status(404);
      res.send({})
    }
  })
}
//req.body = groupQuery : {}, bucketQuery : {}
logic.getBuckets = (req, res) => {
  const bucketQuery = getQuery(req.body.bucketQuery);
  const groupQuery = getQuery(req.body.groupQuery);
  findGroup(groupQuery)
  .then( group => {
    const members = group.members.map( m => m.toString() )
    if ( Array.isArray(group) ) { throw new Error('Get buckets invalid group query'); }
    if ( members.includes(req.user._id.toString() ) ) { return findBucket(bucketQuery); }
    else { throw new Error('User cannot get buckets for group they are not a part of'); }
  })
  .then( buckets => {
    if ( Array.isArray(buckets) ) { res.send(buckets); }
    else { res.send([buckets]) }
  })
  .catch( (e) => {
    logger.error('Error in getBuckets %j %O', req.body, e)
    res.status(404);
    res.send([])
  })
};


// logic.getActiveBuckets


//req.body = { groupQuery : { groupId/key : ... }, bucketData : {name,description} }
logic.createBucket = (req, res) => {
  const groupQuery = getQuery(req.body.groupQuery);
  let createdBucket, group;
  isUserAdminOfGroup(groupQuery, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to create a bucket in this group') }
    group = adminStatus.group;
    const b = new Bucket({
      "creator" : req.user._id,
      "belongsTo" : group._id,
      "name" : req.body.bucketData.name,
      "visibility" : req.body.bucketData.visibility,
      "state" : req.body.bucketData.state,
      "description" : req.body.bucketData.description
    })
    return b.save();
  })
  .then(savedBucket => {
    createdBucket = savedBucket;
    return helpers.addBucketToGroup(groupQuery, createdBucket._id)
  })
  .then( updatedGroup => {
    res.send(createdBucket);
  })
  .catch( e => {
    logger.error('Error in createBucket body : %O user : %O error : %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

logic.deleteBucket = (req, res) => {
  const bucketQuery = getQuery(req.body)
  let bucketId = '';
  Bucket.findOne(bucketQuery)
  .exec()
  .then( bucket => {
    bucketId = bucket._id;
    return getQuery({ _id : bucket.belongsTo });
  })
  .then( groupQuery => isUserAdminOfGroup(groupQuery, req.user) )
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to delete this bucket') }
    Bucket.deleteOne(bucketQuery)
    .exec()
    .then( _ => res.send({success : true}))
  })
  .catch( e => {
    logger.error('Error in deleteBucket body : %O user : %O error : %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}

module.exports = logic;
