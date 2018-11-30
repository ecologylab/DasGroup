process.env.NODE_ENV = 'dev'
//This is now for creating a sample db that is smaller and easier for testing.
const Account = require('../../models/account');
const Mache = require('../../models/mache');
const Element = require('../../models/element');
const Clipping = require('../../models/clipping');
const Role = require('../../models/role');
const Group = require('../../models/group');
const Folio = require('../../models/folio');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const config = require('config')
const seedFile = './scripts/seed/seedData/seedData.json'

const getRandomInt = (max) => Math.floor( Math.random() * Math.floor(max) )
mongoose.connect(config.database.devSeedDb, { useNewUrlParser : true }).then(
  () => { console.log("Connected. Beginning pull"); buildSeed(); },
  err => { console.log("ERROR - Database connection failed")}
)
const pullAccounts = async (percentage) => {
  const accountData = []
  const accounts = await Account.find({ maches : { $exists : true, $not : { $size : 0 } } }).select('-password -hash').exec()
  const selectedAccounts = accounts//.splice( Math.floor(accounts.length * .2), Math.floor(accounts.length * .5)  )
  console.log(`Pulling ${selectedAccounts.length} accounts`)
  return selectedAccounts;
}

const buildGroups = (devUser, allUsers, amount=5, adminAmount=3) => {
  const generateGroup = (fields) => {
    const groupnames = [
        "weight", "sell", "survival", "tick", "preference", "spare", "credibility", "road", "learn", "fireplace", "reproduction", "superior", "rabbit", "conservation", "protest", "mood", "chin", "space", "canvas", "meaning", "trap", "cook", "absorption", "shower", "remember", "venture", "loss", "rise", "quota", "soldier", "dealer", "insist", "incapable", "powder", "resolution", "boot", "stop", "breast", "opposite", "provincial", "country", "design", "reaction", "represent", "heel", "lodge", "exile", "initiative", "final", "psychology", "wear out", "shame", "point", "failure", "pan", "brag", "weave", "boat", "hostility", "factor", "dip", "rest", "abortion", "episode", "complete", "tone", "budge", "world", "barrel", "stir", "volcano", "mosaic", "west", "elephant", "stimulation", "launch", "deficit", "shot", "tropical", "sound", "motorcycle", "curve", "contemporary", "musical", "trade", "flush", "heavy", "prevent", "unrest", "hold", "knot", "pillow", "turn", "wisecrack", "child", "content", "whip", "deter", "color-blind", "white"
      ]
    return {
      "_id" : fields._id || mongoose.Types.ObjectId(),
      "creator" : fields.creator,
      "roles.admins" : fields.admins,
      "members" : fields.members,
      "name" : groupnames[getRandomInt(groupnames.length)] + getRandomInt(100000),
      "description" : 'A brilliant if not meaningless description'
    }
  }
  const getRandomMembers = (n) => {
    const start = getRandomInt(allUsers.length-n)
    const end = start + n
    return allUsers.slice( start, end )
  }
  const groups = []
  for ( let i = 0; i < amount; i++ ) {
    const members = getRandomMembers(20);

    if ( i < adminAmount ) {
      const group = generateGroup({
        creator : devUser._id,
        admins : [devUser._id],
        members : members.map( m => m._id ).concat([devUser._id])
      })
      groups.push(group)
      members.forEach( m => {
        m.memberOf.push(group._id)
      })
      devUser.memberOf.push(group._id)
    } else {
      const group = generateGroup({
        creator : members[0],
        admins : members[0],
        members : members.map( m => m._id )
      })
      members.forEach( m => {
        m.memberOf.push(group._id)
      })
      groups.push(group)
    }
  }
  return groups;
}

const pullMaches = async (allUsers) => {
  const machesReferenced = allUsers.map( u => u.maches ).reduce( (a,b) => a.concat(b) )
  const maches = await Mache.find({ _id : { $in : machesReferenced} }).exec()
  return maches;
}

const buildDevUserAccount = () => {
  return {
    "_id" : mongoose.Types.ObjectId(),
    "username": config.developmentUsername,
    "password": "xxx",
    "email": "DasGroupDevUser@tamu.edu",
    "salt": "xxx",
    "hash": "xxx",
    "bio": "living",
    "memberOf" : [],
    "maches": []
  }
}


const writeToFile = (data, file) => {
  return new Promise( (resolve, reject) => {
    jsonfile.writeFile(file, data, (err) => {
      if (err) { reject(err); }
      else { resolve(true); }
    })
  })
}

const pullElements = async (macheData) => {
  let elementIds = macheData.map( m => m.elements).reduce( (a,b) => a.concat(b) )
  let elements = await Element.find({ _id : { $in : elementIds } }).exec()
  console.log(`Pulled ${elements.length} elements from ${macheData.length} maches`)
  return elements;
}

const pullRoles = async () => {
  //not very many and quite small so pulling all
  const roles = await Role.find({}).exec()
  return roles
}

const pullFolios = async () => {
  //not very many and quite small so pulling all
  const folios = await Folio.find({}).exec()
  return folios
}

const pullGroups = async () => {
  //not very many and quite small so pulling all
  const groups = await Group.find({}).exec()
  return groups
}

const pullClippings = async (elementData) => {
  const clippingIds = elementData.map( e => e.clipping)
  let clippings = await Clipping.find({ _id : { $in : clippingIds } }).exec()
  let reducedClippings = clippings.map( clipping => {
    let oClipping = clipping.toObject();
    if ( oClipping['remoteLocation'] ) {
      oClipping.remoteLocation = '';
    }
    return oClipping;
  })
  console.log(`Pulled ${reducedClippings.length} clippings from ${elementData.length} elements`)
  return reducedClippings;
}


const buildSeed = async () => {
  try {
    const seedData = {};
    const allUsers = await pullAccounts();
    const devUser = buildDevUserAccount()
    const groupData = await buildGroups(devUser, allUsers);
    const macheData = await pullMaches(allUsers);
    const elementData = await pullElements(macheData);
    const clippingData = await pullClippings( elementData );
    const roleData = await pullRoles();
    const trueGroups = await pullGroups();
    const folioData = await pullFolios();
    seedData.accounts = allUsers;
    seedData.accounts.push(devUser)
    seedData.groups = groupData.concat(trueGroups); //creating groups admin of for testing
    seedData.folios = folioData
    seedData.maches = macheData;
    seedData.elements = elementData;
    seedData.clippings = clippingData;
    seedData.roles = roleData;
    await writeToFile(seedData, seedFile)
    console.log('Finished building seed data!');
    process.exit(0);
  } catch ( e ) {
    console.error("Build seed data failed!", e);
    process.exit(0);
  }
}
