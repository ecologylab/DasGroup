const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const bucketSchema = mongoose.Schema({
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
  key: {
    type: String,
    unique: true,
    required : true,
    default : shortId.generate
  },
  maches : [{
    type: ObjectId,
    required : false,
    ref : 'mache'
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

bucketSchema.pre('save', function(next)
{
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Bucket', accountSchema);
