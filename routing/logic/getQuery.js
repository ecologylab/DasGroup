/*

The idea here is I want to really have any request as only some combination of
the below.

A request such as addGroupMember( groupId(s)_or_key(s), accountId(s)_or_username(s)_or_email(s) )
can then be broken into:
  findGroup(getQuery( groupId(s)_or_key(s) ))
  Account.find(getQuery( accountId(s)_or_username(s)_or_email(s) ) )

*/


module.exports = (request) => {
  //possible group queries
  let query = {}
  if ( request.groupId) {
    query = { _id : request.groupId }
  } else if ( request.groupIds ) {
    query = { _id : { $in : request.groupIds.split(',') } }
  } else if ( request.groupKey ) {
    query = { key : request.groupKey }
  } else if ( request.groupKeys ) {
    query = { key : { $in : request.groupKeys.split(',') } }
  }
  //possible bucket queries
  else if ( request.bucketId ) {
    query = { _id : request.bucketId }
  } else if ( request.bucketIds ) {
    query = { _id : { $in : request.groupIds.split(',') } }
  } else if ( request.bucketKey ) {
    query = { key : request.bucketKey }
  } else if ( request.bucketKeys ) {
    query = { key : { $in : request.bucketKeys.split(',') } }
  }
  //possible user queries
  else if ( request.userId ) {
    query = { _id : request.userId }
  } else if ( request.username ) {
    query = { username : request.username }
  } else if ( request.email ) {
    query = { email : request.email }
  } else {
    throw new Error('Invalid query type in group logic')
  }
  return query;
}
