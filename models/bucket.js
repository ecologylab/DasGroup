const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const bucketStates = ['opened', 'closed'] //closed means no maches can be submitted
const bucketVisibilities = ['public', 'private'] //private means only admins can see

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

bucketSchema.pre('save', function(next)
{
    if ( !bucketStates.includes(this.state) ) { this.state = 'closed'; }
    if ( !bucketVisibilities.includes(this.visibility) ) { this.visibility = 'public'; }
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Bucket', bucketSchema);
