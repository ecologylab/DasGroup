import apiWrapper from './apiWrapper.js';
const index = {};


let user = {},
    group = {},
    components = [];

index.getUserAndGroups = () => {
  const userId = $('h1').attr('data-userId');
  apiWrapper.getUser('userId', userId)
  .then( (u) => {
    user = u;
    console.log(u);
    return apiWrapper.getGroups('groupIds',u.memberOf)
  })
  .then( groups => console.log(groups, apiWrapper) )

}





module.exports = index;
