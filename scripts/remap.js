process.env.NODE_ENV = 'dev'
const Folio = require('../models/folio');
const mongoose = require('mongoose');
const config = require('config')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); remapFolio(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const remapFolio = async () => {
  const folios = await Folio.find({}).exec()
  const updatedFolios = folios.map( f => {
    if ( f.visibility == 'public' ) { f.visibility = 'memberOnly'; }
    if ( f.visibility == 'private' ) { f.visibility = 'adminOnly'; }
    if ( f.visibility == 'transparent' ) { f.visibility = 'everyone'; }
    f.transparent = false;
    return f.save();
  })
  Promise.all( updatedFolios )
  .then( _ => {
    console.log("Done with remap!")
    process.exit(0)
  })
  .catch( e => {
    console.error("Remap failed! ", e)
    process.exit(1);
  })
}
