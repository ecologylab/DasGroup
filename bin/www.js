const app = require('../app');
const debug = require('debug')('debug:server');
const https = require('https');
const fs = require('fs');
const port = process.env.PORT || '3000';
app.set('port', port)

const server = https.createServer({
  'key' : fs.readFileSync('./config/key.pem'),
  'cert' : fs.readFileSync('./config/cert.crt')
}, app);

server.listen(port);
server.on('error', (err) => {
  switch (err.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  console.log(`Listening on port ${port}`);
})
