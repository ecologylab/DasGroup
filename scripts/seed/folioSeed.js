process.env.NODE_ENV = 'dev'
//This uses the seed data which should have been populated from buildSeedData
const Account = require('../../models/account');
const Group = require('../../models/group');
const Mache = require('../../models/mache');
const Folio = require('../../models/folio');
const Role = require('../../models/role');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData/seedData.json';
const jsonfile = require('jsonfile');
const config = require('config')
//
// mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
//   () => { console.log("Connected and seeding!"); },
//   err => { console.log("ERROR - Database connection failed")}
// )
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
let names = [
  "weight", "sell", "survival", "tick", "preference", "spare", "credibility", "road", "learn", "fireplace", "reproduction", "superior", "rabbit", "conservation", "protest", "mood", "chin", "space", "canvas", "meaning", "trap", "cook", "absorption", "shower", "remember", "venture", "loss", "rise", "quota", "soldier", "dealer", "insist", "incapable", "powder", "resolution", "boot", "stop", "breast", "opposite", "provincial", "country", "design", "reaction", "represent", "heel", "lodge", "exile", "initiative", "final", "psychology", "wear out", "shame", "point", "failure", "pan", "brag", "weave", "boat", "hostility", "factor", "dip", "rest", "abortion", "episode", "complete", "tone", "budge", "world", "barrel", "stir", "volcano", "mosaic", "west", "elephant", "stimulation", "launch", "deficit", "shot", "tropical", "sound", "motorcycle", "curve", "contemporary", "musical", "trade", "flush", "heavy", "prevent", "unrest", "hold", "knot", "pillow", "turn", "wisecrack", "child", "content", "whip", "deter", "color-blind", "white"
]
let folioData = [
  {
    description : "Oh so awesome folio",
    visibility : "memberOnly",
    state : "opened",
    macheSubmissions : []

  },
  {
    description : "The colors, oh the colors",
    visibility : "adminOnly",
    state : "opened",
    macheSubmissions : []

  },
  {
    description : "Oh so closed folio",
    visibility : "everyone",
    state : "closed",
    macheSubmissions : []
  }
]

const addMachesToFolios = async () => {
  try {
    let saves = [];
    const groups = await Group.find({})
    .populate({path : 'members', populate : { path : 'maches' } })
    .populate({ path : 'folios' , populate : { path : 'macheSubmissions.mache' } })
    .exec()
    const machesToSave = []
    const alreadySaved = {}
    groups.forEach( group => {
      group.members.forEach( member => {
        member.maches.forEach( (mache, i) => {
            group.folios.forEach( folio => {
              if ( getRandomInt(5) === 1  ) {
                folio.macheSubmissions.push({
                  mache : mache._id,
                  submitter : member._id,
                  date_submitted : Date.now()
                })
                mache.memberOfFolios.push(folio._id)
                machesToSave.push(mache)
              }
            })
        })
      })
      saves = saves.concat( group.folios.map( f => f.save() ) )
    })
    machesToSave.forEach( mache => {
      if ( !alreadySaved.hasOwnProperty(mache._id) ) {
        saves.push( mache.save() )
      }
      alreadySaved[mache._id] = true
    })
    Promise.all(saves)
    .then(_ => { console.log("Added maches to folios"); return true; })
    .catch(e => console.error(e) )
  }
  catch  ( e ) {
    console.log(e);
  }

}

const seedFolios = async() => {
  console.log("Seeding Folios")
  let user = await Account.findOne({ username : config.developmentUsername }).populate('memberOf').exec()
  const saves = []
  const groups = await Group.find({}).exec()
  groups.forEach( g => {
    for ( let i = 0; i < 5; i++ ) {
      let f = folioData[getRandomInt(folioData.length)]
      f.name = 'Folio ' + names[getRandomInt(names.length)]
      f.creator = user._id;
      f.belongsTo = g._id;
      let folio = new Folio(f)
      g.folios.push(folio._id);
      saves.push(folio.save())
    }
    saves.push(g.save())
  })
  await Promise.all(saves);
  await addMachesToFolios();
  return true;
}
// seedFolios()
module.exports = seedFolios;
