import axios from 'axios'


const logic = {}

//{ userId : } or { username : } or { email : }
logic.getUser = (key, value) => {
  axios.get(`/getUser?${key}=${value}`)
  .then( (response) => {
    console.log(response)
  })
  .catch( e => {
    console.error('Error getUser ', key, value, e)
  })

}
// .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )

module.exports = logic;
