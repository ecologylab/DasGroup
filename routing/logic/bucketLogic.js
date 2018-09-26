const Account = require('../../models/account')
const Group = require('../../models/group')
const Bucket = require('../../models/bucket')
const logger = require('../../utils/logger');
const getQuery = require('./getQuery');
const groupLogic = require('./logic/groupLogic');
const logic = {};

const isUserAdminOfGroup = groupLogic.isUserAdminOfGroup;
const findGroup = groupLogic.findGroup;



//this expects req.body = { groupQuery : { groupId/key : ... }, bucketData : {} }
logic.createBucket = (req, res) => {
  const groupQuery = getQuery(req.body.groupQuery);
  isUserAdminOfGroup(groupQuery, req.user)
  .then( adminStatus => {
    if ( !adminStatus.isAdmin ) { throw new Error('User is not authorized to create a bucket in this group') }
    const group = adminStatus.group,
    const b = new Bucket({
      "creator" : req.user._id,
      "belongsTo" : group._id,
      "name" : req.body.bucketData.name,
      "description" : req.body.bucketData.description
    })
    return b.save();
  })
  .then(savedBucket => res.send(savedBucket) )
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
