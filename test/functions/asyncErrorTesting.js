process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Folio = require('../models/folio');
const Mache = require('../models/mache');
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
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => {
    console.log("Connected!");
    test();
    },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();
const getQuery = helpers.getQuery;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
const testError = (id, delay, sendError) => {
  return new Promise( (resolve, reject) => {
    setTimeoutPromise(delay || 1000)
    .then( _ => {
      if ( sendError ) {
        console.log(`${id} is REJECTING!`)
        reject(false);
      }
      else {
        console.log(`${id} is finishing!`)
        resolve(true);
      }
    })
    .catch( e => {
      console.log("This should not be happening")
    })
  })
}

const getGroups = async (req, res) => {
  try {
    const query = getQuery(req.query);
    const collect = () => {
      const promises = [];
      const collection = {}
      return new Promise( (resolve, reject) => {
        promises.push( Group.find(query).exec() );
        Promise.all(promises)
        .then( ([ groups ]) => {
          collection.groups = groups;
          resolve(collection);
        })
        .catch(e => {
          console.log("In the catch error block and rejecting")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      return new Promise( (resolve, reject) => {
        resolve(true);
      })
    }

    const collection = await collect('groups');
    const validated = await validate(collection);

    const groups = collection.groups;
    res.send(groups);

  } catch (error) {
    logger.error('Error in getGroups %j %O', req.query, e)
    res.status(404);
    res.send([])
  }
};

const test = async () => {
  let t = await getGroups({ query : { 'groupKey' : 'abc' } })
  console.log(t);
}


const asyncTesting = async () => {
  try {
    let a1 = testError('a1', 2000, true);
    console.log("started a1!");
    let a2 = testError('a2', 2000, true)
    console.log("started a2!");
    let col = { a1 : await a1, a2 : await a2 }
    console.log("results: ", col)
  } catch (error) {
    console.log("Caught one boss reject: ", error)
  }
  // let groups = await getGroups({ query : { 'groupKey' : 'abc' }})


}
