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
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;


//req.body = { bucketQuery : { bucketId/key : ... }, macheId : id
//FIX ME check that user owns mache when mache model is in
logic.addMacheToBucket = (req, res) => {
  const bucketQuery = getQuery(req.body.bucketQuery);
  findBucket(bucketQuery)
  .then( bucket => {
    const bucketSubmissions = bucket.macheSubmissions.map( (m) => m.mache._id.toString() )
    const memberOf = req.user.memberOf.map( gId => gId.toString() )
    if ( !memberOf.includes(bucket.belongsTo.toString() ) ) { throw new Error('User cannot add maches to bucket if they dont belong to group') }
    if ( bucket.state == 'closed' ) { throw new Error('User cannot add mache to closed bucket') }
    if ( bucketSubmissions.includes(req.body.macheId) ) {
      logger.notice('Mache attempted add to bucket where it already existed %O %O', req.user, req.body)
      res.send(bucket);
    } else {
      bucket.macheSubmissions.push({
        mache : req.body.macheId,
        submitter : req.user._id,
        date_submitted : Date.now()
      })
      return bucket.save()
    }
  })
  .then( updatedBucket => res.send(updatedBucket))
  .catch( e => {
    logger.error('Error in addMachesToBucket body : %O user : %O error : %O', req.body, req.user, e)
    res.status(404);
    res.send({})
  })
}
//req.body = groupQuery : {}, bucketQuery : {}
logic.getBuckets = (req, res) => {
  const bucketQuery = getQuery(req.body.bucketQuery);
  const groupQuery = getQuery(req.body.groupQuery);
  findBucket(query)
  .then( buckets => {
    if ( Array.isArray(buckets) ) { res.send(buckets); }
    else { res.send([buckets]) }
  })
  .catch( (e) => {
    logger.error('Error in getBuckets %j %O', req.query, e)
    res.status(404);
    res.send([])
  })
};





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
