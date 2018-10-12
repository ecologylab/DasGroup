const logger = require('./logger')
const Bucket = require('../../models/bucket')
const bucketHelpers = {}

const findBucket = (query) => {
  return new Promise( (resolve, reject) => {
    Bucket.find(query).exec()
    .then( (bucket) => {
      if ( bucket.length === 1 ) { resolve(bucket[0]) }
      else if ( bucket.length < 1 ) { reject('No bucket found')}
      else { resolve(bucket); }
    })
    .catch( e => {
      logger.error('Error in findBucket %j %O', query, e)
      reject(e);
    })
  })
}







bucketHelpers.findBucket = findBucket;
module.exports = bucketHelpers;
