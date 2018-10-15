const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const roleSchema = mongoose.Schema({
  name: {
    type: String,
    default: "CustomRole"
  },
  predefined: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String,
  }]
})




module.exports = mongoose.model('Role', roleSchema);
