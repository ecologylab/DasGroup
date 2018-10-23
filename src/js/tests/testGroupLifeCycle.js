import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js'; //just for testing

//storing for later use by testDeletion
let createdGroup;

const getRandomName = () => {
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  let names = [
    "weight", "sell", "survival", "tick", "preference", "spare", "credibility", "road", "learn", "fireplace", "reproduction", "superior", "rabbit", "conservation", "protest", "mood", "chin", "space", "canvas", "meaning", "trap", "cook", "absorption", "shower", "remember", "venture", "loss", "rise", "quota", "soldier", "dealer", "insist", "incapable", "powder", "resolution", "boot", "stop", "breast", "opposite", "provincial", "country", "design", "reaction", "represent", "heel", "lodge", "exile", "initiative", "final", "psychology", "wear out", "shame", "point", "failure", "pan", "brag", "weave", "boat", "hostility", "factor", "dip", "rest", "abortion", "episode", "complete", "tone", "budge", "world", "barrel", "stir", "volcano", "mosaic", "west", "elephant", "stimulation", "launch", "deficit", "shot", "tropical", "sound", "motorcycle", "curve", "contemporary", "musical", "trade", "flush", "heavy", "prevent", "unrest", "hold", "knot", "pillow", "turn", "wisecrack", "child", "content", "whip", "deter", "color-blind", "white"
  ]
  return names[getRandomInt(names.length-1)]
}

const testGroupCreation = (userAndGroups) => {
  const user = userAndGroups.user;
  const groups = userAndGroups.groups;
  let randomMembers = groups[0].members;
  return new Promise( (resolve, reject) => {
    createGroup(getRandomName())
    .then( newGroup => {
      createdGroup = newGroup;
      return addGroupMembers(newGroup._id, randomMembers)
    })
    .then( updatedGroup => addGroupAdmins(updatedGroup._id, randomMembers.slice(1,3) ))
    .then( _ => {
      console.log("%cGroup Creation tests passed", "color: green");
      console.log("CREATED GROUP", createdGroup)
      resolve(createdGroup)
    })
    .catch(e => {
      console.error("Error running tests", e)
      reject(e);
    })

  })
}

const leaveGroup = () => {
  return new Promise( (resolve, reject) => {
    apiWrapper.leaveGroup({ groupId : createdGroup._id })
    .then( _ => {
      console.log("%c Leave group test passed!", "color : blue" )
      console.log("User has left")
      resolve(true);
    })
    .catch( e => {
      console.error("%cFAILED leave group", 'color : red', e)
      reject(e);
    })
  })
}

const joinGroup = () => {
  return new Promise( (resolve, reject) => {
    apiWrapper.joinGroup({ groupId : createdGroup._id})
    .then( _ => {
      console.log("%c Join group test passed!", "color : blue" )
      resolve(true);
    })
    .catch( e => {
      console.error("%cFAILED join group", 'color : red', e)
      reject(e);
    })
  })
}

const createGroup = (name) => {
  return new Promise( (resolve, reject) => {
    let group = {
      name : 'Group ' + name,
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
    let promotions = newAdmins.map( adminId => apiWrapper.promoteToAdmin({ groupId : groupId }, { 'userId' : adminId}) )
    Promise.all(promotions)
    .then( resolves => {
      console.log("%cTest addGroupMembers - passed",  "color: green")
      resolve(true);
    })
    .catch( e => {
      console.error("%c Test delete group failed", "color : red")
      reject(e)
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

const testGroupDeletion = () => {
  return new Promise( (resolve, reject) => {
    apiWrapper.deleteGroup({ groupId : createdGroup._id})
    .then( s => {
      console.log("%c Test delete group passed", "color : green");
      resolve(true)
    })
    .catch( e => {
      console.error("%c Test delete group failed", "color : red")
      reject(e)
    })
  })
}





module.exports = { creation : testGroupCreation, deletion : testGroupDeletion };
