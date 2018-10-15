import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import index from './index.js';
import group from './group.js';
import test from './test.js';
if ( window.location.pathname.includes('test') && NODE_ENV == 'dev' ) {
  test.init()
  .then( usersAndGroups => test.tests(usersAndGroups) )
  .then( testStatus => console.log('Testing complete : ', testStatus) )
  .catch( e => console.error('Error in tests: ' , e ))
} else if ( window.location.pathname.includes('group') ) {
  group.init()
  .then( usersAndGroup => console.log(group))
  .catch( e => console.error('Error in group.init', e) )
} else {
  index.init()
  .then( status => console.log(status) )
  .catch( e => console.error('Error in index.init', e) )
}
