import axios from 'axios'
const retryOnStatusCodes = [ 202 ]
const resolveOnStatusCodes = [ 200 ]

const retry = (requestFn, retryCount, delay) => {
  delay = delay || 100;
  let request = Promise.reject();
  const rejectDelay = (error) => {
    return new Promise( (resolve, reject) => {
      setTimeout(reject.bind(null, error), delay)
    })
  }
  const testResponse = (response) => {
    if ( response.hasOwnProperty('status') ) {
      if ( resolveOnStatusCodes.includes(response.status) ) { return response; }
      else if ( retryOnStatusCodes.includes(response.status) ) { throw response; }
      else { throw new Error('retry failed') }
    }
    else {
      throw new Error('retry failed');
    }
  }
  const makeAttempt = () => {
   return requestFn();
  }
  for ( let i = 0; i < retryCount; i++ ) {
  	request = request.catch(makeAttempt).then(testResponse).catch(rejectDelay);
  }
  return request;
}

module.exports = retry;
