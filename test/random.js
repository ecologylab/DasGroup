process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
const accountLogic = require('../routing/logic/accountLogic')
const helpers = require('../routing/helpers/helpers')
const config = require('config')
const tokenHandler = require('../utils/tokenHandler')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
let group = {}
const randomId = mongoose.Types.ObjectId();


// Account.find({username : 'avsphessre'})
// .exec()
// .then( u => {
//   if ( !u ) { console.log("in if", u) }
//   else { console.log(u) }
// })

//
// helpers.findUser({username : 'avsphere'})
// .then( u => console.log(u) )
// .catch(e => console.log(e) )


// console.log(config, this)
let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjViYjRmMTA2YmM3NTM1MzUzMjQ2NDAxNCIsImNyZWF0ZWRfb24iOiIyMDE4LTEwLTAzVDE2OjQwOjM4Ljg1OVoiLCJsYXN0X21vZGlmaWVkIjoiMjAxOC0xMC0wM1QxNjo0MDozOC44NTlaIiwiaW1hZ2UiOiI1OGMwNWEyMTUwYmJjY2FkNTcwMzhlMzAiLCJ1c2VybmFtZSI6ImF2c3AiLCJkaXNwbGF5bmFtZSI6ImF2c3AiLCJlbWFpbCI6ImF2c3AuaGVyZUBiYW11LmVkdSIsImFjdGl2YXRlX2FjY291bnRfdG9rZW4iOiJkNzI5MzhjZjMyOTk0YzJkZDQyNDc4MjMzM2JlY2ZhYTZmMDJhYmE0IiwiYWN0aXZhdGVfYWNjb3VudF9leHBpcmVzIjoiMjAxOC0xMC0wM1QxNzo0MDozOC4xMTRaIiwiX192IjowLCJwcmVmZXJlbmNlcyI6eyJtaW5pbWFwIjoibGVmdCIsImVsZW1lbnRfc25hcCI6dHJ1ZSwic2hvd19ncmlkIjp0cnVlfSwiYWNjZXNzX2NvZGUiOiIiLCJjb25zZW50X2Jhc2VsaW5lIjp0cnVlLCJhY3RpdmF0ZV9hY3RpdmF0ZWQiOmZhbHNlLCJzY2hvbGFyX2V4cGxvcmVyIjp7ImV4cGxvcmF0aW9uX2lkcyI6W119LCJtYWNoZXMiOltdLCJmb2xsb3dlcnMiOltdLCJmb2xsb3dpbmciOltdLCJhdmF0YXJzIjpbIjU4YzA1YTIxNTBiYmNjYWQ1NzAzOGUzMCJdfSwiaWF0IjoxNTM5MjA0MDQyLCJleHAiOjE1MzkyMDc2NDJ9.OSS1Wo9spjsdx40tNW1frIOZmSRJgB2b7dR9Uz4tY0M`;


let data = tokenHandler.decryptToken(token);
console.log(data.data);
