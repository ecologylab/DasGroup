import axios from 'axios'
import $ from 'jquery';
import logic from '../logic.js';
import apiWrapper from '../apiWrapper.js'; //just for testing




const runTests = (userAndGroups) => {
  const user = userAndGroups.user;
  const groups = userAndGroups.groups;
  let randomMembers = groups[0].members;
  return new Promise( (resolve, reject) => {
    getGroups(user)
    .then( _ => getGroupMembers(user, groups) )
    .then( groupsMembers => createGroup(user) )
    .then( newGroup => addGroupMembers(newGroup._id, randomMembers) )
    .then( updatedGroup => addGroupAdmins(updatedGroup._id, randomMembers.slice(1,3) ))
    .then( updatedGroup => {
      console.log("With new admins", updatedGroup)
      resolve(true);
    })
    .catch(e => {
      console.error("Error running tests", e)
      reject(e);
    })

  })
}

const getGroups = (user) => {
  return new Promise( (resolve, reject) => {
    apiWrapper.getGroups('groupIds', user.memberOf)
    .then( groups => {
      if ( user.memberOf.length === groups.length) {
        console.log("Test getGroups - passed")
        resolve(true)
      } else {
        reject('Error getGroupsTest - user.memberOf does not equal the groups returned')
      }
    })
    .catch( e => {
      console.error("Error when getting groups", e)
      reject(e);
    })
  })
}

const getGroupMembers = (user, groups) => {
  let groupMembersPromises = groups.map( g => apiWrapper.getGroupMembers('groupId', g._id))
  return new Promise( (resolve, reject) => {
    Promise.all( groupMembersPromises )
    .then( groupsMembers => {
      groupsMembers.forEach( groupMembers => {
        const includesOwner = groupMembers.map( m => m._id ).includes( user._id )
        if ( !includesOwner ) { reject(`A group that ${user} is in does not contain them as a member`); }
      })
      console.log("Test getGroupMembers - passed")
      resolve(groupsMembers);
    })
    .catch( e => {
      console.error("Error when getting group members", e)
      reject(e);
    })
  })
}
const createGroup = (user) => {
  return new Promise( (resolve, reject) => {
    let group = {
      name : "A testy group",
      description : "Such test much fun",
      visibility : "public",
      adminIds : [],
      members : []
    }
    apiWrapper.createGroup(group)
    .then( group => {
      if ( group ) { console.log('Test createGroup - passed') }
      resolve(group);
    })
    .catch( e => {
      console.error("Error when creating group", e)
      reject(e);
    })
  })
}

//This isnt wrapped because it should be replaced by the invite logic
const addGroupMembers = (groupId, newMembers) => {
  return new Promise( (resolve, reject) => {
    axios.post('/a/addGroupMembers', { groupQuery : { groupId : groupId }, newMembers : newMembers})
    .then( (response) => {
      console.log("Test addGroupMembers - passed")
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupMembers members ', groupId, newMembers, e)
      reject(e);
    })
  })
}

//This isnt wrapped because it should be replaced by the invite logic
const addGroupAdmins = (groupId, newAdmins) => {
  return new Promise( (resolve, reject) => {
    axios.post('/a/addGroupAdmins', { groupQuery : { groupId : groupId }, newAdmins : newAdmins})
    .then( (response) => {
      console.log("Test addGroupAdmins - passed")
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupAdmins members ', groupId, newAdmins, e)
      reject(e);
    })
  })
}




module.exports = runTests;
