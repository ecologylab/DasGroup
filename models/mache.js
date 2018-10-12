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

  },
  copied_from: mongoose.Schema.Types.ObjectId,
  hidden: { type : Boolean, default : false}




})

macheSchema.pre('save', function(next)
{
    this.last_modified = new Date();
    next();
});




module.exports = mongoose.model('Mache', macheSchema);
