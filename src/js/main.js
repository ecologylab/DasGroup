import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import axios from 'axios'
import index from './index.js';
import test from './test.js';

if ( window.location.pathname.includes('test') ) {
  test.init()
  .then( usersAndGroups => test.tests(usersAndGroups) )
  .then( testStatus => console.log('Testing complete : ', testStatus) )
  .catch( e => console.error('Error in tests: ' , e ))
} else {
  index.init()
  .then( usersAndGroups => console.log(usersAndGroups))
  .catch( e => console.error('Error in index.init', e) )
}
