const Account = require('../../models/account')
const Group = require('../../models/group')
const Mache = require('../../models/mache')
const Folio = require('../../models/folio')
const logger = require('../../utils/logger');
const groupLogic = require('./groupLogic');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const logic = {};

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max))
const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findFolio = helpers.findFolio;
const findGroup = helpers.findGroup;
const findMache = helpers.findMache;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;


const addMacheToFolioShotgun = async (groupLocator) => {
  try {
    let saves = [];
    const groups = await Group.find( getQuery(groupLocator) )
    .populate({path : 'members', populate : { path : 'maches' } })
    .populate({ path : 'folios' , populate : { path : 'macheSubmissions.mache' } })
    .exec()
    groups.forEach( group => {
      group.members.forEach( member => {
        member.maches.forEach( mache => {
          group.folios.forEach( folio => {
            folio.macheSubmissions.push({
              mache : mache._id,
              submitter : member._id,
              date_submitted : Date.now()
            })
          })
        })
      })
      saves = saves.concat( group.folios.map( f => f.save() ) )
    })
    Promise.all(saves)
    .then(_ => { return true; })
    .catch(e => console.error(e) )
  }
  catch  ( e ) {
    console.log(e);
  }

}

logic.addMachesToFolios = async (req, res) => {
  try {
    await addMacheToFolioShotgun(req.body)
    res.send({success  : true})
  }
  catch (error) {
    console.error(error);
    res.send(error);
  }
}

logic.addMacheToFolioShotgun = addMacheToFolioShotgun;
module.exports = logic;
