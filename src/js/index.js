import logic from './logic.js';
const index = {};


let user = {},
    group = {},
    components = [];

index.getUserAndGroups = () => {
  const userId = $('h1').attr('data-userId');
  logic.getUser('userId', userId)
  .then( (u) => {
    user = u;
    console.log(u);
    return logic.getGroups('groupIds',u.memberOf)
  })
  .then( groups => console.log(groups) )

}





module.exports = index;
