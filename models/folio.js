const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const shortId = require('shortid');
const folioStates = ['opened', 'closed'] //closed means no maches can be submitted
const folioVisibilities = ['public', 'private'] //private means only admins can see

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

folioSchema.pre('save', function(next)
{
    if ( !folioStates.includes(this.state) ) { this.state = 'closed'; }
    if ( !folioVisibilities.includes(this.visibility) ) { this.visibility = 'public'; }
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Folio', folioSchema);
