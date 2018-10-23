const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const macheSchema = mongoose.Schema({
  creator : {
    type: ObjectId,
    ref: 'Account'
  },
  current_users : [{
    type: mongoose.Schema.Types.Mixed,
  }],
  memberOfFolios : [{
    type: ObjectId,
    required : false,
    ref : 'Folio'
  }],
  users : [{
    user : {
      type: ObjectId,
      required: false,
      ref: 'Account'
    },
    role : {
      type: ObjectId,
      required: false,
      ref: 'role'
    },
    roleNum : Number
  }],
  title : {
    type : String,
    default : 'Untitled Mache'
  },
  description : {
    type : String,
    default : ''
  },
  visibility : {
    type : String,
    default : 'public',
  },
  background_color : {
    type : String
  },
  elements : [{
    type: ObjectId,
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
  },
  last_modified: {
    type: Date,
    default: Date.now(),
  },
  default_role : {
    role : {
      type: ObjectId,
      ref: "role"
    },
    roleNum : {
      type: Number,
      default: 3
    }
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
