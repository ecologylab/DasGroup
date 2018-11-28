process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose');
const axios = require('axios');
const jsonFile = require('jsonfile')
const Clipping = require('../../models/clipping');
const path = require('path')
const fs = require('fs')


mongoose.connect(config.database.devSeedDb, { useNewUrlParser : true }).then(
  () => { console.log("Connected. Beginning pull"); run(); },
  err => { console.log("ERROR - Database connection failed")}
)


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let failedClippings = 0;
const checkImageClipping = (imageClipping) => {
  const requestUrl = `https://livemache.ecologylab.net${imageClipping.localLocation}`;
  return new Promise( (resolve, reject) => {
    axios.get( requestUrl )
    .then( res => resolve( { success : imageClipping } ) )
    .catch( e => {
      failedClippings++;
      resolve({ fail : imageClipping, url : requestUrl })
    })
  })
}


const testClippings = async () => {
  let clippings = await Clipping.find({}).select('-semantics').exec()
  try {
    const imageClippingChecks = clippings
    .map( c => c.toObject() )
    .filter( c => c['remoteLocation'] && c['localLocation'] )
    .map( async( imageClipping,i  ) => {
      await sleep(i*400)
      const clippingCheck = await checkImageClipping(imageClipping)
      if ( i % 1000  == 0 ) { console.log(`Tested ${i} clippings. FailedClippings : ${failedClippings}`)}
      return clippingCheck;
    })

    // console.log(`Found ${requestUrls.length} image clippings that have a local and remote path`)

    const requestStatuses = await Promise.all(imageClippingChecks)
    await jsonFile.writeFile( path.join(__dirname, `seedData/clippingRequestStatus.json`), requestStatuses)

    console.log('Write success')
    return requestStatuses;
  } catch ( e ) {
    console.log("Pull clipping fail", e)
  }
}



const analyzeResults = async() => {
  const jsonData = await jsonFile.readFile( path.join(__dirname, 'seedData/clippingRequestStatus.json') )
  let testing = []
  let failedUrls = []
  let i = 0;
  let j = 0;
  jsonData.forEach( testResult => {
     if ( testResult.hasOwnProperty('fail') ) {
       testResult.fail.remoteLocation = '';
       i++
       failedUrls.push(testResult.url)
       testing.push(testResult);
     } else {
       testResult.success.remoteLocation = '';
       j++;
       testing.push(testResult);
     }
  })
  console.log('Failures', i);
  console.log('success', j);
  await jsonFile.writeFile( path.join(__dirname, 'seedData/clippingRequestStatusNODATASTRING.json'), testing)
  return true
}

const run = async () => {
  // await testClippings()
  await analyzeResults()
  console.log("Complete!")
  process.exit(0);
}
