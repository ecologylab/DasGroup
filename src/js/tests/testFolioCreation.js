import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js'; //just for testing

let folioData = [
  {
    name : "Awesome folio",
    description : "Oh so awesome folio",
    visibility : "public",
    state : "open"
  },
  {
    name : "Colorful folio",
    description : "The colors, oh the colors",
    visibility : "private",
    state : "open"
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
    .then( folios =>  folios )
    .then( chosenFolio => console.log("CHOSEN F", chosenFolio) )
    .catch(e => {
      console.error("Error running tests", e)
      reject(e);
    })
  })
}


const createFolio = (groupId, folioData) => {
  return new Promise( (resolve, reject) => {
    apiWrapper.createFolio( { groupId : groupId }, folioData)
    .then( (response) => {
      console.log("%cTest createFolio - passed",  "color: blue")
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error createFolio members ', groupId, folioData, e)
      reject(e);
    })
  })
}




module.exports = runTests;
