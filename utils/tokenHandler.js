const jwt = require('jsonwebtoken');
const config = require('config')
let secret = "othelloIsNotADog";



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
