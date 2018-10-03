const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid')
const logger = require('../utils/logger')
const groupSchema = mongoose.Schema({
  creator: {
    type: ObjectId,
    required : true,
    ref : 'account'
  },
  members : [{
    type: ObjectId,
    required : false,
    ref : 'account'
  }],
  roles : {
    admins : [{
      type: ObjectId,
      required : true,
      ref : 'account'
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
  buckets : [{
    type: ObjectId,
    required : false,
    ref : 'bucket'
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
  this.last_modified = new Date();
  next();
});

groupSchema.post('remove', function(deletedGroup, next) {
  const members = deletedGroup.members;
  logger.notice("Deleting a group, should remove groupId from all members who are part of")
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


module.exports = mongoose.model('Group', groupSchema);
