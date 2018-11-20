const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const logger = require('../utils/logger')
const clippingSchema = mongoose.Schema({
  type : String,
  copied_from : ObjectId
});


module.exports = mongoose.model('Clipping', clippingSchema);
