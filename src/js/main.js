import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import axios from 'axios'

let userId = $('h1').attr('data-userId');
let user = {}
axios.post('/getUser', { userId : userId } )
.then( (response) => { console.log("User: ", response.data.user); return response.data.user; })
.then( (user) => axios.post('/getGroup', { groupId : user.memberOf[0] } ) )
.then( (response) => {
  console.log("Group: ", response.data.group)
})
