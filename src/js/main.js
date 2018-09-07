import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import axios from 'axios'

$('#loginButton').on('click', (el) => {
  el.preventDefault();
  let username = $('#inputUsername').val(),
      password = $('#inputPassword').val();
  axios.post('/login', {
    username : username,
    password : password
  })
  .then( (res) => {
    if ( res.statusText === 'OK' ) {
      if ( res.data.success === true ) {
        window.location.href = '/postLogin'
      }
    } else { console.log("FAILED", res); }
  })
  .catch( (err) => {
    console.log("ERROR in request runner login", err);
    resolve(err);
  })
})

$('#visitDashboard').on('click', (el) => {
  el.preventDefault();
  window.open('/getToken')
})
