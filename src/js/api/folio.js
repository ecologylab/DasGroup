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
      console.error('Error creating folio', groupLocator, e)
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
      console.error('Error getOpenedFolios', e)
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
      console.error('Error addMacheToFolio', folioQuery, e)
      reject(e);
    })
  })
}
//folioQuery : { folioId/folioKey : ... } macheQuery : { macheId/macheKey : ... }
wrapper.removeMacheFromFolio = (folioQuery, macheQuery, retryCount) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/removeMacheFromFolio`, { folioQuery : folioQuery, macheQuery : macheQuery })
    .then( (response) => {
      if ( response.status === 202) {
        console.error('version conflict in removeMacheFromFolio')
      }
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error removeMacheFromFolio', folioQuery, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
