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

const seedFolios = async() => {
  let user = await Account.findOne({ username : config.developmentUsername }).populate('memberOf').exec()
  const saves = []
  user.memberOf.forEach( async (g) => {
    console.log("Folios added to ", g.name);
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
  return true;
}




module.exports = seedFolios;
