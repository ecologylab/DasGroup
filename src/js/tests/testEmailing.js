import axios from 'axios'
import $ from 'jquery';
import helpers from '../helpers/helpers.js';
import apiWrapper from '../api/apiWrapper.js';


const testEmailUsers = async() => {
  let userLocator = { usernames : ['avsphere'] }
  let { data } = await axios.post(`${BASEPATH}a/emailUsers`, {userLocator : userLocator, emailBodyHtml : '<p> Yo yo yo </p>', emailSubject : `Hi from monica lol <3 ${Math.random()}`})
  console.log("Data", data)
}

const testEmailSubscribers = async() => {
  let { data } = await axios.post(`${BASEPATH}a/emailSubscribers`, {emailBodyHtml : '<p> Yo yo yo </p>', emailSubject : `Hi from monica lol <3 ${Math.random()}`})
  console.log("Data", data)
}

module.exports = {testEmailUsers : testEmailUsers, testEmailSubscribers : testEmailSubscribers};
