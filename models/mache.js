const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const macheSchema = mongoose.Schema({
  creator : {
    type: ObjectId,
    required: true,
    ref: 'account'
  },
  current_users : [{
    type: ObjectId,
    required: true,
    ref: 'account'
  }],
  memberOfBuckets : [{
    type: ObjectId,
    required : false,
    ref : 'bucket'
  }],
  users : [{
    user : {
      type: ObjectId,
      required: false,
      ref: 'account'
    },
    role : {
      type: ObjectId,
      required: false,
      ref: 'role'
    }
  }],
  title : {
    type : String,
    required : true,
    default : 'Untitled Mache'
  },
  description : {
    type : String,
    required : true,
    default : ''
  },
  visibility : {
    type : String,
    required : true,
    default : 'public',
  },
  background_color : {
    type : String
  },
  elements : [{
    type: ObjectId,
    required: true,
    ref: 'element'
  }],
  hash_key: {
    type: String,
    unique: true,
    required : true,
    default : shortId.generate
  },
  thumbnail : {
    location : { type : String }
  },
  tags: [String],
  created_on : {
    type: Date,
    default: Date.now(),
    required: true
  },
  last_modified: {
    type: Date,
    default: Date.now(),
    required : true
  },
  default_role : {
    type: ObjectId,
    required: false,
    ref: 'role'
  },
  copied_from : {
      type: ObjectId,
      required: false,
      ref: 'mache'
    },
  hidden: { type : Boolean, default : false}
})

macheSchema.pre('save', function(next)
{
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Mache', macheSchema);
