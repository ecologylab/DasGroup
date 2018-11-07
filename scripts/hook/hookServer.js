const path = require('path')
process.env["NODE_CONFIG_DIR"] = path.join(__dirname, '../../config/')
process.env.NODE_ENV = 'hook'
const config = require('config')
const http = require('http')
const createHandler = require('github-webhook-handler')
const handler = createHandler({ path: config.hook.path, secret: config.hook.path })
const exec = require('child_process').exec;
const currPath = path.join(__dirname, '/scripts/hook');


const runner = (cmd, cb) => {
  const child = exec(cmd, (err, stdout, stderr) => {
    if ( err ) { return cb(new Error(err), null) }
    else if ( typeof(stderr) != "string" ) { return cb(new Error(stderr), null) }
    else { return cb(null, stdout) }
  })
}

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(config.hookPort)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)
    const buildPath = './scripts/hook/buildStaging.sh';
    runner(`sh ${buildPath}`, (err, response) => {
      if ( err ) { console.log("Error! ", err) }
      else {
        console.log(response);
      }
    })

})

handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})

const buildPath = './scripts/hook/buildStaging.sh';
console.log(buildPath)
runner(`sh ${buildPath}`, (err, response) => {
  if ( err ) { console.log("Error! ", err) }
  else {
    console.log(response);
  }
})
