const accountWrappers = require('./account')
const groupWrappers = require('./group')
const folioWrappers = require('./folio')



const buildHelpers = (modules) => {
  const functionKeys = {}
  const helper = {}
  modules.forEach( mod => {
    for ( let functionKey in mod ) {
      if ( functionKeys.hasOwnProperty(functionKey) ) { throw new Error('Helper aggregation namespace error'); }
      else {
        functionKeys[functionKey] = true;
        helper[functionKey] = mod[functionKey]
      }
    }
  })
  return helper;
}
const wrapper = buildHelpers([
  accountWrappers, groupWrappers, folioWrappers
])
















window.wrapper = wrapper;

// .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )

module.exports = wrapper;
