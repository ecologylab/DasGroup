const mongoose = require('mongoose');

module.exports = (schema) => {
  schema.set('saveErrorIfNotFound', true);
  if ( !schema.get('versionKey') ) {
    schema.set('versionKey', '__v');
  }
  const versionKey = schema.get('versionKey');

  schema.pre('save', function(next) {
    this['$where'] = {
      [versionKey] : this[versionKey]
    };
    this.increment();
    next();
  });
}
