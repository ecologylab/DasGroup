import axios from 'axios'
const wrapper = {};

//groupLocator : { groupId/groupKey : ... }, folioData
wrapper.createFolio = (groupLocator, folioData) => {
  let request = { groupQuery : groupLocator, folioData : folioData };
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/createFolio`, request)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error creating folio', group, e)
      reject(e);
    })
  })
}

wrapper.getOpenedFolios = () => {
  return new Promise( (resolve, reject) => {
    axios.get(`${BASEPATH}a/getOpenedFolios`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getOpenedFolios', group, e)
      reject(e);
    })
  })
}

//folioQuery : { folioId/folioKey : ... } macheQuery : { macheId/macheKey : ... }
wrapper.addMacheToFolio = (folioQuery, macheQuery) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/addMacheToFolio`, { folioQuery : folioQuery, macheQuery : macheQuery })
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addMacheToFolio', group, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
