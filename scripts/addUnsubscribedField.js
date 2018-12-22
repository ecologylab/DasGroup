process.env.NODE_ENV = 'staging'
const Account = require('../models/account');
const mongoose = require('mongoose');
const config = require('config')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected and remapping!"); remapAccounts(true); },
  err => { console.log("ERROR - Database connection failed")}
)

const remapAccounts = async () => {
  const accounts = await Account.find({}).exec()
  const updatedAccounts = accounts.map( a => {
    a.unsubscribed = false;
    return a.save();
  })
  Promise.all( updatedAccounts )
  .then( _ => {
    console.log("Done with account remap!")
    process.exit(0)
  })
  .catch( e => {
    console.error("Remap failed! ", e)
    process.exit(1);
  })
}
