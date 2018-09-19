const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Group = require('./group');
const accountSchema = mongoose.Schema({
  username: {
    type : String,
    required : true,
    unique : true
  },
  email: {
    type : String,
    required : true,
    unique : true
  },
  password: {
    type: String,
    required : false
  },
  salt: {
    type: String,
    required : false
  },
  hash: {
    type : String,
    required : false
  },
  bio: {
    type : String,
    required : false,
   },
  avatars: [{
    type: ObjectId,
     required : false,
     ref : 'image'
   }],
  image: {
    type: ObjectId,
    required : false,
    ref : 'image'
  },
  following : [{
    type: ObjectId,
    required : false,
    ref : 'account'
  }],
  followers : [{
    type: ObjectId,
    required : false,
    ref : 'account'
  }],
  maches : [{
    type: ObjectId,
    required : false,
    ref : 'mache'
  }],
  memberOf : [{
    type: ObjectId,
    required : false,
    ref : 'group'
  }],
  adminOf : [{
    type: ObjectId,
    required : false,
    ref : 'group'
  }],
  scholar_explorer: {
    user_id : { type: String, required: false },
    exploration_ids : [{ type:String, required: false}]
  },
  reset_password_token : {
    type : String,
    required : false
  },
  reset_password_expires : {
    type : Date,
    required : false
  },
  consent_baseline:
  {
    type: Boolean,
    required: true,
    default: false
  },
  facebook: {
    id : { type : String, required: false },
    token : { type : String, required: false },
  },
  google : {
    id : { type : String, required: false },
    token : { type : String, required: false },
  },
  preferences:
  {
      show_grid:
      {
          type: Boolean,
          default: true,
          required: true
      },
      element_snap:
      {
          type: Boolean,
          default: true,
          required: true
      },
      minimap:
      {
          type: String,
          default: "left",
          required: true
      }
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

accountSchema.pre('save', function(next)
{
    this.last_modified = new Date();;
    next();
});

// accountSchema.methods.getGroups = function() {
//   let groups = this.memberOf;
//   return new Promise( (resolve, reject) => {
//     if ( this.groups.length == 0 ) {
//       logger.info('getGroups - user is not part of any groups')
//       resolve([]);
//     }
//     Group
//     .find({'_id' : { $in : groups } } )
//     .exec()
//     .then( (groups) => {
//       if ( !groups ) { reject('getGroups - Could not find any of the listed groups'); }
//       resolve(groups);
//     })
//   })
// }


module.exports = mongoose.model('Account', accountSchema);
