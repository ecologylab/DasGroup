/*

The idea here is I want to really have any request as only some combination of
the below.

A request such as addGroupMember( groupId(s)_or_key(s), accountId(s)_or_username(s)_or_email(s) )
can then be broken into:
  findGroup(getQuery( groupId(s)_or_key(s) ))
  Account.find(getQuery( accountId(s)_or_username(s)_or_email(s) ) )

*/

const getQuery = (request) => {
  //possible group queries
  let key = Object.keys(request)[0];
  if ( request[key] == "undefined") { throw new Error(`getQuery query value undefined request : ${request}`) }
  let query = {};
  if ( request.groupId) {
    query = { _id : request.groupId }
  } else if ( request.groupIds ) {
    query = Array.isArray(request.groupIds)
    ? query = { _id : { $in : request.groupIds } }
    : query = { _id : { $in : request.groupIds.split(',') } }
  } else if ( request.groupKey ) {
    query = { key : request.groupKey }
  } else if ( request.groupKeys ) {
    query = Array.isArray(request.groupKeys)
    ? query = { key : { $in : request.groupKeys } }
    : query = { key : { $in : request.groupKeys.split(',') } }
  }
  //possible folio queries
  else if ( request.folioId ) {
    query = { _id : request.folioId }
  } else if ( request.folioIds ) {
    query = Array.isArray(request.folioIds)
    ? query = { _id : { $in : request.folioIds } }
    : query = { _id : { $in : request.folioIds.split(',') } }
  } else if ( request.folioKey ) {
    query = { key : request.folioKey }
  } else if ( request.folioKeys ) {
    query = Array.isArray(request.folioKeys)
    ? query = { key : { $in : request.folioKeys } }
    : query = { key : { $in : request.folioKeys.split(',') } }
  }
  //possible mache queries
  else if ( request.macheId ) {
    query = { _id : request.macheId }
  } else if ( request.macheIds ) {
    query = Array.isArray(request.macheIds)
    ? query = { _id : { $in : request.macheIds } }
    : query = { _id : { $in : request.macheIds.split(',') } }
  } else if ( request.macheKey ) {
    query = { hash_key : request.macheKey }
  } else if ( request.macheKeys ) {
    query = Array.isArray(request.macheKeys)
    ? query = { hash_key : { $in : request.macheKeys } }
    : query = { hash_key : { $in : request.macheKeys.split(',') } }
  }
  //possible user queries
  else if ( request.userId ) {
    query = { _id : request.userId }
  } else if ( request.userIds ) {
    query = Array.isArray(request.userIds)
    ? query = { _id : { $in : request.userIds } }
    : query = { _id : { $in : request.userIds.split(',') } }
  }
  else if ( request.username ) {
    query = { username : request.username }
  } else if ( request.usernames ) {
    query = Array.isArray(request.usernames)
    ? query = { username : { $in : request.usernames } }
    : query = { username : { $in : request.usernames.split(',') } }
    console.log("QQ", query)
  }
  else if ( request.email ) {
    query = { email : request.email }
  } else if ( request.emails ) {
    query = Array.isArray(request.usernames)
    ? query = { email : { $in : request.emails } }
    : query = { email : { $in : request.emails.split(',') } }
  }
  else {
    throw new Error('Invalid query type in getQuery')
  }
  query.visibility = { $ne : 'removed' };
  return query;
}

const getQueryType = (request) => {
  let key = Object.keys(request)[0];
  if ( request[key] == "undefined") { throw new Error('getQueryType query value undefined') }
  let queryType = ''
  if ( key.includes('group') ) {
    queryType = 'group'
  } else if ( key.includes('folio') ) {
    queryType = 'folio'
  } else if ( key.includes('mache') ) {
    queryType = 'mache'
  } else if ( key.includes('user') || key.includes('email')  ) {
    queryType = 'account'
  } else {
    throw new Error(`unknown query type request : ${request}`)
  }

  return queryType
}

module.exports = {
  getQuery : getQuery,
  getQueryType : getQueryType
}
