import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import axios from 'axios'
import index from './index.js';
import group from './group.js';
import admin from './admin.js';
import test from './test.js';
import emailTester from './tests/testEmailing.js'

if ( window.location.pathname.includes('test') ) {
  window.axios = axios
  if ( NODE_ENV.includes('prod') == 'false' ) {
    test.init()
    .then( usersAndGroups => test.tests(usersAndGroups) )
    .then( testStatus => console.log('Testing complete : ', testStatus) )
    .catch( e => console.error('Error in tests: ' , e ))
  }
} else if ( window.location.pathname.includes('admin') ) {
  console.log("Emailer", emailTester)
  admin.init()
  .catch( e => console.error('Error in admin.init', e) )
} else if ( window.location.pathname.includes('group') ) {
  group.init()
  .catch( e => console.error('Error in group.init', e) )
} else {
  index.init()
  .then( status => console.log(status) )
  .catch( e => console.error('Error in index.init', e) )
}
