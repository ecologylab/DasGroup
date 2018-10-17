import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js'; //just for testing
import retry from '../helpers/retry.js'

const testRetry = (userAndGroups) => {
  return new Promise( (resolve, reject) => {
    let reqFn = axios.post.bind(null, '/t/testRetry', { data : true })
    retry(reqFn, 100, 20)
    .then( d => {
      console.log('%cRetry Test success!', "color: green", d)
    })
    .catch( e => {
      console.error('Retry test failed!', e)
    })
  })
}


module.exports = testRetry;
