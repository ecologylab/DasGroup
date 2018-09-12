const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const bucketSchema = mongoose.Schema({
  belongsTo: {
    type: ObjectId,
    required : true,
    ref : 'group'
  },
  maches : [{
    type: ObjectId,
    required : true,
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
    this.last_modified = new Date();;
    next();
});




module.exports = mongoose.model('Bucket', accountSchema);
