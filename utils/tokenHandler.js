const jwt = require('jsonwebtoken');
require('dotenv').config()
let secret = process.env.TOKEN_SECRET;



module.exports = {
  generateToken : (payload) => jwt.sign({ data: payload }, secret, { expiresIn: '1h' }),
  decryptToken : (token) => {
    try {
      let decoded = jwt.verify(token, secret);
      return decoded;
    } catch(err) {
      console.error(err);
      return false;
    }
  }
}
