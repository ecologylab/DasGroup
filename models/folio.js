const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const Group = require('./group')
const Mache = require('./mache')
const logger = require('../utils/logger')
const folioStates = ['opened', 'closed', 'removed'] //closed means no maches can be submitted
const folioVisibilities = ['transparent', 'public', 'private'] //transparent menas users can see contents, private means only admins can see
const folioSchema = mongoose.Schema({
  creator : {
    type: ObjectId,
    required: true,
    ref: 'account'
  },
  belongsTo: {
    type: ObjectId,
    required : true,
    ref : 'group'
  },
  visibility: {
    type: String,
    required : true,
    default : 'public'
  },
  state : {
    type : String,
    require : true,
    default : 'closed'
  },
  key: {
    type: String,
    unique: true,
    required : true,
    default : shortId.generate
  },
  macheSubmissions : [{
    mache : {
      type: ObjectId,
      required : false,
      ref : 'mache'
    },
    submitter : {
      type: ObjectId,
      required : false,
      ref : 'account'
    },
    date_submitted : {
      type: Date,
      default: Date.now(),
      required: true
    }
  }],
  name: {
    type: String,
    required : true
  },
  description: {
    type: String,
    required : true
  },
  created_on : {
    type: Date,
    default: Date.now(),
    required: true
  },
  last_modified: {
    type: Date,
    default: Date.now(),
    required : true
  }

})

//Since we are pseudoRemoving this should not be called
folioSchema.post('remove', function(deletedFolio, next) {
  logger.notice('A remove was called on a folio')
  // //Deleted folio needs to be removed from its group
  Group.findOne({ _id : deletedFolio.belongsTo }).exec()
  .then( group => {
    const indexToRemove = group.folios.indexOf(deletedFolio._id)
    console.log("group bef", group.folios.length)
    group.folios.splice(indexToRemove, 1);
    return group.save();
  })
  .catch( e => logger.error("Error in folioSchema post mache find %O", e))
  //Maches should no longer reference deleted folio
  const macheIds = deletedFolio.macheSubmissions.map( sub => sub.mache )
  Mache.find({ _id : { $in : macheIds } }).exec()
  .then( maches => {
    let savePromises = []
    maches.forEach( m => {
      const indexToRemove = m.memberOfFolios.indexOf(deletedFolio._id);
      m.memberOfFolios.splice(indexToRemove,1)
      savePromises.push(m.save())
    })
    return Promise.all(savePromises)
  })
  .catch( e => logger.error("Error in folioSchema post mache find %O", e))
  next();
});

folioSchema.methods.pseudoRemove = function() {
  this.visibility = 'removed';
  return this.save();
}

folioSchema.pre('save', function(next)
{
    if ( !folioStates.includes(this.state) ) { this.state = 'closed'; }
    if ( !folioVisibilities.includes(this.visibility) ) { this.visibility = 'public'; }
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Folio', folioSchema);
