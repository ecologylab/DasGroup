import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js'; //just for testing

const testGroupCreation = (userAndGroups) => {
  const user = userAndGroups.user;
  const groups = userAndGroups.groups;
  let randomMembers = groups[0].members;
  return new Promise( (resolve, reject) => {
    createGroup(user)
    .then( newGroup => addGroupMembers(newGroup._id, randomMembers) )
    .then( updatedGroup => addGroupAdmins(updatedGroup._id, randomMembers.slice(1,3) ))
    .then( updatedGroup => {
      console.log("%cGroup Creation tests passed", "color: green");
      console.table(updatedGroup)
      resolve(updatedGroup);
    })
    .catch(e => {
      console.error("Error running tests", e)
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
      if ( group ) { console.log('%cTest createGroup - passed',  "color: blue") }
      resolve(group);
    })
    .catch( e => {
      console.error("Error when creating group", e)
      reject(e);
    })
  })
}

const addGroupAdmins = (groupId, newAdmins) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/addGroupAdmins`, { groupQuery : { groupId : groupId }, newAdmins : newAdmins})
    .then( (response) => {
      console.log("%c Test addGroupAdmins - passed",  "color: blue")
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupAdmins members ', groupId, newAdmins, e)
      reject(e);
    })
  })
}

const addGroupMembers = (groupId, newMembers) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/addGroupMembers`, { groupQuery : { groupId : groupId }, newMembers : newMembers})
    .then( (response) => {
      console.log("%cTest addGroupMembers - passed",  "color: green")
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addGroupAdmins members ', groupId, newMembers, e)
      reject(e);
    })
  })
}





module.exports = testGroupCreation;
