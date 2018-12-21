const Account = require('../../models/account')
const Group = require('../../models/group')
const logger = require('../../utils/logger');
const delay = require('../../utils/delay');
const helpers = require('../helpers/helpers')
const RequestError = require('../../utils/errors/RequestError')
const mailer = require('../../utils/mailer.js')
const logic = {};
const config = require('config')
const uniqId = helpers.uniqId;
const getQuery = helpers.getQuery;
const findGroup = helpers.findGroup;
const isUserAdminOfGroup = helpers.isUserAdminOfGroup;

logic.renderAdmin = async (req, res) => {
  try {
    const query = getQuery({groupKey : req.params.key})
    const collect = () => {
      const collection = {};
      return new Promise( (resolve, reject) => {
        Group.findOne(query)
        .populate('members', 'username')
        .populate('roles.admins', 'username')
        .populate('folios', 'name state visibility macheSubmissions')
        .exec()
        .then( group => {
          collection.group = group;
          resolve(collection)
        })
        .catch( e => {
          logger.error("renderGroup collect error")
          reject(e);
        })
      })
    }
    const validate = (collection) => {
      let errorMessage = '';
      return new Promise( (resolve, reject) => {
        const groupExists = () => {
          let successStatus = true;
          if ( !collection.group ) {
            errorMessage = 'group does not exist'
            successStatus = false;
          }
          return successStatus;
        }
        const userIsAdminOfGroup = () => {
          let successStatus = true;
          //in collect i populate admins
          const admins = collection.group.roles.admins.map( a => a._id.toString() )
          if ( admins.indexOf(req.user._id.toString() ) === -1 ) {
            errorMessage = 'user is not admin of group'
            successStatus = false;
          }
          return successStatus;
        }
        if ( groupExists() && userIsAdminOfGroup() ) {
          resolve(true);
        } else {
          logger.error("renderAdmin validate error")
          reject(`validateError ${errorMessage}`)
        }
      })
    }

    const collection = await collect('group');
    const validated = await validate(collection);
    const renderData = {
      user :  req.user,
      group : collection.group,
    }
    req.user.currentGroup = collection.group;
    res.render('admin', renderData)
  } catch ( err ) {
    logger.error('Error in renderAdmin %j %O', req.query, err)
    res.status(404);
    res.redirect('/')
  }
}


logic.emailUsers = async(req, res) => {
  try {
    const { emailBodyHtml, emailSubject } = req.body
    const query = getQuery(req.body.userLocator);
    const users = await Account.find(query).exec()
    const usersWithEmail = users.filter( u => u.toObject().hasOwnProperty('email') )
    console.log("Emailings users", usersWithEmail)
    const pendingEmails = usersWithEmail.map( async(u,i) => {
      await delay(i*300) //not wanting to possibly overload queue, so spacing 300ms apart
      return mailer.sendMail({
        from : config.nodemailer.username,
        to : u.email,
        subject : emailSubject,
        html : emailBodyHtml
      })
    })
    await Promise.all(pendingEmails)
    res.send({success : true, emailedUsers : usersWithEmail.map( u => u._id )  })

  } catch ( err ) {
    logger.error('Error in email users %j %O', req.body, err)
    res.status(404);
    res.redirect('/')
  }
}

logic.emailSubscribers = async(req, res) => {
  try {
    const { emailBodyHtml, emailSubject } = req.body
    if ( !emailBodyHtml || !emailSubject ) { throw new Error('Check params') }
    const subscribedUsers = await Account.find({ unsubscribed : false }).exec()
    const usersWithEmail = subscribedUsers.filter( u => u.toObject().hasOwnProperty('email') )
    const pendingEmails = usersWithEmail.map( async(u,i) => {
      await delay(i*300) //not wanting to possibly overload queue, so spacing 300ms apart
      return mailer.sendMail({
        from : config.nodemailer.username,
        to : u.email,
        subject : emailSubject,
        html : emailBodyHtml
      })
    })
    await Promise.all(pendingEmails)
    res.send({success : true, emailedUsers : usersWithEmail.map( u => u._id )  })

  } catch ( err ) {
    logger.error('Error in email subscribers %j %O', req.body, err)
    res.status(404);
    res.send({ success : false, error : 'check params'})
  }
}

module.exports = logic;
