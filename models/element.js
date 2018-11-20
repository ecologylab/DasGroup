const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const logger = require('../utils/logger')
const elementSchema = mongoose.Schema({
    z:
    {
        type: Number,
        default: 1
    },
    x:
    {
        type: Number,
        default: 1
    },
    y:
    {
        type: Number,
        default: 1
    },
    height:
    {
        type: Number,
        default: 1
    },
    width:
    {
        type: Number,
        default: 1
    },
    opacity:
    {
        type: Number,
        default: 1
    },
    transforms: [],
    clipping:
    {
        type: ObjectId,
        ref: 'Clipping'
    },

    connectsTo: [ { type: String } ],

    children: [ {} ],

    anchored:
    {
        type: Boolean,
        default: false
    },
    locked:
    {
        type: Boolean,
        default: false
    },
    creator:
    {
        type: ObjectId,
        ref: 'Account'
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
    },
    copied_from: {
      type: ObjectId,
      ref: 'Mache'
    },
});

elementSchema.pre('save', function(next)
{
  this.last_modified = new Date();;
  next();
});


module.exports = mongoose.model('Element', elementSchema);
