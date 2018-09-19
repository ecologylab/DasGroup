import logic from './logic.js';
const index = {};

index.queryUser = () => {
  let userId = $('h1').attr('data-userId');
  let user = {}
  console.log(logic);

  // axios.get('/getUser?username=avsphere')
  // .then( (response) => { console.log("User: ", response.data); return response.data; })
  // .then( (user) => axios.get(`/getGroup?groupId=${user.memberOf[0]}`) )
  // .then( (response) => {
  //   console.log("Group: ", response.data)
  // })

}

module.exports = index;
