const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const groupSchema = mongoose.Schema({
  creator: {
    type: ObjectId,
    required : true,
    ref : 'account'
  },
  admins : [{
    type: ObjectId,
    required : true,
    ref : 'account'
  }],
  members : [{
    type: ObjectId,
    required : false,
    ref : 'account'
  }],
  visibility: {
    type: String,
    required : true,
    default : 'public'
  },
  key: {
    type: String,
    unique: true,
    required : true
  },
  name: {
    type: String,
    unique: true,
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

groupSchema.pre('save', function(next)
{
    this.last_modified = new Date();;
    next();
});




module.exports = mongoose.model('Group', groupSchema);
