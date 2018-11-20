process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose');
const axios = require('axios');
const Clipping = require('../../models/clipping');
const fs = require('fs')

mongoose.connect(config.database.devSeedDb, { useNewUrlParser : true }).then(
  () => { console.log("Connected. Beginning pull"); pullClippingUrls(); },
  err => { console.log("ERROR - Database connection failed")}
)

const pullClippingUrls = async () => {
  let clippings = await Clipping.find({}).limit(1000).exec()
  try {
    const requestUrls = clippings
    .map( c => c.toObject() )
    .filter( c => c['remoteLocation'] && c['localLocation'] )
    .map( imageClipping => `https://livemache.ecologylab.net${imageClipping.localLocation}` )
    console.log(`Found ${requestUrls.length} image clippings that have a local and remote path`)

    const requestStatuses = await Promise.all(
      requestUrls
      .map( req => axios.get(req)
      .then( res => { return { success : res.config.url } })
      .catch( e => { return { fail : req } } ) )
    )

    console.log(requestStatuses)



  } catch ( e ) {
    console.log("Pull clipping fail", e)
  }

}
