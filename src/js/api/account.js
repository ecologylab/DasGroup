import axios from 'axios'
const wrapper = {};

wrapper.getUser = (key, value) => {
  return new Promise( (resolve, reject) => {
    axios.get(`${BASEPATH}a/getUser?${key}=${value}`)
    .then( (response) => {
      resolve(response.data)
    })
    .catch( e => {
      console.error('Error getUser ', key, value, e)
      reject(e);
    })
  })
}

module.exports = wrapper;
