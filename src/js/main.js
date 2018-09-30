import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import axios from 'axios'
import index from './index.js';


index.init()
.then( userAndGroups => {
  // if ( userAndGroups.user )
  return index.tests(userAndGroups)
})
.then( testStatus => {
  console.log("Testing complete: ", testStatus)
})
.catch( e => console.error('Error in main chain', e))
