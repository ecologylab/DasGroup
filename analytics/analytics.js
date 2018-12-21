process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');
const { extractMaches, extractElements, extractClippings } = require('./helpers')
const testAnalytics = require('./testAnalytics')
const analytics = {}

const macheAnalytics = require('./macheAnalytics')


process.argv.forEach( val => {
  if ( val.includes('solo') || val === '-s') ) {
    mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
      () => { console.log("Connected to database. Running analytics");  },
      err => { console.log("ERROR - Database connection failed")}
    )
    //run stuff
  }
})

//i take your collection and I extract from it the operandType
//ie if the type is mache and you pass groups I get maches from group



//operandType : mache, user... if it is user it would extract users from collection
//collection : collection of a single type

const main = ( operandType, collection, applyingFnSet ) => {
  const operandTypes = ['mache', 'user', 'group']
  const applyMache = () => applyingFnSet.map( functionName => )
}


module.exports = analytics
