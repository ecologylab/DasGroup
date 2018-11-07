process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
const nodemailer = require('nodemailer')
const config = require('config')

const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : config.nodemailer.username,
    pass : config.nodemailer.password
  }
});



module.exports = transporter;
