const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Account = require('./account')
const shortId = require('shortid')
const logger = require('../utils/logger')
const groupVisibilities = ['public', 'private', 'removed'] //private means invite only
const groupSchema = mongoose.Schema({
  creator: {
    type: ObjectId,
    required : true,
    ref : 'Account'
  },
  members : [{
    type: ObjectId,
    required : false,
    ref : 'Account'
  }],
  roles : {
    admins : [{
      type: ObjectId,
      required : true,
      ref : 'Account'
    }]
  },
  visibility: {
    type: String,
    required : true,
    default : 'public'
  },
  key: {
    type: String,
    unique: true,
    required : true,
    default : shortId.generate
  },
  name: {
    type: String,
    required : true
  },
  description: {
    type: String,
    required : true
  },
  folios : [{
    type: ObjectId,
    required : false,
    ref : 'folio'
  }],
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

groupSchema.pre('save', function(next) {
  if ( !groupVisibilities.includes(this.visibility) ) { this.visibility = 'public'; }
  this.last_modified = new Date();
  next();
});
//Since we are pseudoRemoving this should not be called
groupSchema.post('remove', function(deletedGroup, next) {
  logger.notice('A remove was called on a group')
  const members = deletedGroup.members;
  const deletedGroupId = deletedGroup._id;
  Account.find({ _id : { $in : members } }).exec()
  .then( members => {
    members.forEach( m => {
      const indexToRemove = m.memberOf.indexOf(deletedGroupId);
      m.memberOf.splice(indexToRemove,1)
      m.save();
    })
  })
  .catch( e => logger.error("Error in groupSchema post remove %O", e))
  next();
});

groupSchema.methods.getGroupMembers = function(AccountDependency) {
  let members = this.members;
  return new Promise( (resolve, reject) => {
    if ( members.length == 0 ) {
      logger.info('getGroupMembers - No members in group')
      resolve([]);
    }
    AccountDependency.find({'_id' : { $in : members } })
    .select('-hash -salt')
    .exec()
    .then( (groupMembers) => {
      if ( !groupMembers ) { reject('Could not find group members'); }
      resolve(groupMembers);
    })
  })
}
groupSchema.methods.pseudoRemove = function() {
  this.visibility = 'removed';
  return this.save();
}



module.exports = mongoose.model('Group', groupSchema);
