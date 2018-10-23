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

const delay = (n) => {
  return new Promise( (resolve, reject) => {
    setTimeout( () => {
      resolve(true)
    }, n)
  })
}

const runTests = (group) => {
  let createdFolios = [];
  return new Promise( (resolve, reject) => {
    const folioCreationPromises = folioData.map( folioData => createFolio(group._id, folioData) )
    Promise.all(folioCreationPromises)
    .then( folios => {
      createdFolios = folios;
      return folios.filter( f => f.state == 'opened' && f.visibility == 'public')[0]
    })
    .then( chosenFolio => addMachesToFolio(group, chosenFolio) )
    //.then( updatedFolio => removeMacheFromFolio(group, updatedFolio) )
    .then(delay(1000))
    //.then( _ => deleteFolios(createdFolios))
    .then( _ => {
      console.log("%c Testing Folio lifecycle complete", "color : green")
      resolve(true)
    })
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
      console.log("%cTest createFolio - passed.",  "color: blue")
      // console.table(createdFolio)
      resolve(createdFolio)
    })
    .catch( e => {
      console.error('Error createFolio members ', groupId, folioData, e)
      reject(e);
    })
  })
}

const addMachesToFolio = (group, folio) => {
  let machesToAdd_count, machesActuallyAdded_count;
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', group.creator)
    .then( creator => {
      const addMachePromises  = creator.maches.map( macheId => apiWrapper.addMacheToFolio( { folioId : folio._id }, { macheId : macheId } ) )
      machesToAdd_count = addMachePromises.length;
      return Promise.all( addMachePromises )
    })
    .then( updatedFolios => {
      const updatedFolio = updatedFolios.reduce( (a,b) => {
        if ( a.__v > b.__v ) { return a; }
        else { return b; }
      })
      machesActuallyAdded_count = updatedFolio.macheSubmissions.length;
      console.log("%cTest addMachesToFolio - passed.",  "color: blue")
      // console.table(updatedFolio)
      resolve(updatedFolio)

    })
    .catch( e => {
      console.error('Error addMachesToFolio members ', group, folio, e)
      reject(e);
    })

  })
}
//This must happen sequentially, or the concurrent write will fail because of a version difference
const removeMacheFromFolio = (group, folio) => {
  let preRemoveCount = folio.macheSubmissions.length,
      removeLength;
  return new Promise( (resolve, reject) => {
    apiWrapper.getUser('userId', group.creator)
    .then( creator => {
      //FIX ME -- many removes should hit retry on fail
      let removeMaches = creator.maches.splice(0, 2);
      removeLength = removeMaches.length;
      const manyRemoves = removeMaches.map( macheId => apiWrapper.removeMacheFromFolio( { folioId : folio._id }, { macheId : macheId } ) )
      return Promise.all( manyRemoves )
    })
    .then( updatedFolios => {
      //updatedFolios is not neccesarily the newest mongo version
      console.log("%cTest removeMacheFromFolio",  "color: blue")
      resolve(updatedFolios[0])
    })
    .catch( e => {
      console.error('Error removeMacheFromFolio members ', group, folio, e)
      reject(e);
    })
  })
}

const deleteFolios = (folios) => {
  return new Promise( (resolve, reject) => {
    Promise.all( folios.map( folio => apiWrapper.deleteFolio({ folioId : folio._id }) ) )
    .then( _ => {
      console.log("%c Test delete folios passed!", "color : blue")
      resolve(true)
    })
    .catch( e => {
      console.error('Error deleteFolios failed ', e)
      reject(e);
    })
  })
}




module.exports = runTests;
