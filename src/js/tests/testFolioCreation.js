import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js'; //just for testing

let folioData = [
  {
    name : "Awesome folio",
    description : "Oh so awesome folio",
    visibility : "public",
    state : "opened"
  },
  {
    name : "Colorful folio",
    description : "The colors, oh the colors",
    visibility : "private",
    state : "opened"
  },
  {
    name : "Beautiful but closed folio",
    description : "Oh so closed folio",
    visibility : "private",
    state : "closed"
  }
]

const runTests = (group) => {
  return new Promise( (resolve, reject) => {
    const folioCreationPromises = folioData.map( folioData => createFolio(group._id, folioData) )
    Promise.all(folioCreationPromises)
    .then( folios => folios.filter( f => f.state == 'opened' && f.visibility == 'public')[0]  )
    .then( chosenFolio => addMachesToFolio(group, chosenFolio) )
    .then( updatedFolio => removeMacheFromFolio(group, updatedFolio) )
    .catch(e => {
      console.error("Error running tests", e)
      reject(e);
    })
  })
}


const createFolio = (groupId, folioData) => {
  return new Promise( (resolve, reject) => {
    apiWrapper.createFolio( { groupId : groupId }, folioData)
    .then( (createdFolio) => {
      console.log("%cTest createFolio - passed. Logging created folio: ",  "color: blue")
      console.table(createdFolio)
      resolve(createdFolio)
    })
    .catch( e => {
      console.error('Error createFolio members ', groupId, folioData, e)
      reject(e);
    })
  })
}

const addMachesToFolio = (group, folio) => {
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', group.creator)
    .then( creator => {
      const addMachePromises  = creator.maches.map( macheId => apiWrapper.addMacheToFolio( { folioId : folio._id }, { macheId : macheId } ) )
      return Promise.all( addMachePromises )
    })
    .then( updatedFolios => {
      let folioCount = updatedFolios.length;
      console.log("%cTest addMachesToFolio - passed. Logging folio after add maches:",  "color: blue")
      console.table(updatedFolios[folioCount-1])
      resolve(updatedFolios[folioCount-1])
    })
    .catch( e => {
      console.error('Error addMachesToFolio members ', group, folio, e)
      reject(e);
    })

  })
}
//This must happen sequentially, or the concurrent write will fail because of a version difference
const removeMacheFromFolio = (group, folio) => {
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', group.creator)
    .then( creator => {
      //FIX ME -- many removes should hit retry on fail
      const manyRemoves = creator.maches.map( macheId => apiWrapper.removeMacheFromFolio( { folioId : folio._id }, { macheId : macheId } ) )
      return Promise.all( manyRemoves )
    })
    .then( updatedFolio => {
      console.log("%cTest removeMacheFromFolio - passed Logging folio after remove maches: ",  "color: blue")
      console.table(updatedFolio)
      resolve(updatedFolio)
    })
    .catch( e => {
      console.error('Error removeMacheFromFolio members ', group, folio, e)
      reject(e);
    })

  })
}




module.exports = runTests;
