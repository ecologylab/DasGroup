const mapCode = (code) => {
  const codesToText = {
    0 : "Misc Error",
    1 : "Permission Error",
    2 : "Version Error"
  }
  return codesToText[code];
}

module.exports = function RequestError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.code = code || 0;
  this.codeType = mapCode(code);
};

require('util').inherits(module.exports, Error);
