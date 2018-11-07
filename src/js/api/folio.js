import axios from 'axios'
import retry from '../helpers/retry'
const wrapper = {};

//groupLocator : { groupId/groupKey : ... }, folioData
wrapper.createFolio = (groupLocator, folioData) => {
  let request = { groupLocator : groupLocator, folioData : folioData };
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

wrapper.updateFolio = (folioLocator, folioData) => {
  let request = { folioLocator : folioLocator, folioData : folioData };
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/updateFolio`, request)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error updating folio', groupLocator, e)
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

//folioLocator : { folioId/folioKey : ... } macheLocator : { macheId/macheKey : ... }
wrapper.addMacheToFolio = (folioLocator, macheLocator) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/addMacheToFolio`, { folioLocator : folioLocator, macheLocator : macheLocator })
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addMacheToFolio', folioLocator, e)
      reject(e);
    })
  })
}
//folioLocator : { folioId/folioKey : ... } macheLocator : { macheId/macheKey : ... }
wrapper.removeMacheFromFolio = (folioLocator, macheLocator) => {
  const requestUrl = `${BASEPATH}a/removeMacheFromFolio`;
  const requestParams = { folioLocator : folioLocator, macheLocator : macheLocator };
  let reqFn = axios.post.bind(null, requestUrl,  requestParams);
  return new Promise( (resolve, reject) => {
    retry(reqFn, 5)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error removeMacheFromFolio', folioLocator, e)
      reject(e);
    })
  })
}

wrapper.deleteFolio = (folioLocator) => {
  return new Promise( (resolve, reject) => {
    axios.post(`${BASEPATH}a/deleteFolio`, folioLocator)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error addMacheToFolio', folioLocator, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
