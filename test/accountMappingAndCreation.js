const Account = require('../models/account');
const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); runTests(); },
  err => { console.log("ERROR - Database connection failed")}
)

let tests = []

const runTests = () => {
  clearAccounts()
  .then( () => dropIndexes() )
  .then( () => seedBasic() )
  .then( () => insertOldAccounts() )
  .then( () => process.exit(0) )
  .catch( (e) => console.error('Error in account mapping tests', e))
}

const clearAccounts = () => {
  return new Promise( (resolve, reject) => {
    Account.deleteMany({}, err => {
      if ( err ) { console.error(err); }
      else { resolve(true); }
    })
  })
}


const dropIndexes = () => {
  return new Promise( (resolve, reject) => {
    Account.collection.dropIndexes(err => {
      if ( err ) { console.error(err); }
      else { resolve(true); }
    })
  })
}

const seedBasic = () => {
  return new Promise( (resolve, reject) => {
    const a = new Account({
      username : 'avsphere',
      password : 'avsphere',
      email : 'avsp.here@gmail.com',
      salt : 'xxx',
      hash : 'xxx',
      bio : 'living',
      maches : []
    })
    a.save().then( (doc, e) => {
      if (e) { reject(e); }
      console.log("seedBasic complete!");
      resolve(true);
    })
  })
}





const insertOldAccounts = () => {
  return new Promise( (resolve, reject) => {
    let a1Json = `{"_id":"5b834fdfbd4834833728e5a7","created_on":"2018-08-27T01:11:59.942Z","last_modified":"2018-08-27T01:12:33.624Z","salt":"bd1bd83257827d0201995b6ebf388b5527eeea6cd64cfabd0347435585e1b461","hash":"b6d35a199fcf607e0409e057dfe46d07d6737b0babecf16ad9cbc3c3635721fbcb3f4feeae1f1b143df3cb5157d792abe2435175bf3f6aa2059d9f15fb183b791a65d1b43ee60aba49d5ac29b2e3c1f6a80be0f59a4e1728310b85289efe8e61402be291af36f5157af37473c4ec219fc80e74cab15d6e684ff1e66b77e6dfeee7169f7552f146ce4b50692228dc4191622f776d8ef553498dcf5986ff9319e5da123d1382461f3537aeae6f120ba3a9ce947fd0441b03ce8be5106248df56c43ef9110f3efcc68311e09d69dae379f56d21f5f4eced88801be13cf0aa675b17f9fea9450d42d34164254e7e66bbf56cbfa9efee91de417c60977b243c2e152049e5d7e42cc2f89e4cff4745a71af9b7ab804d549552da5a369baffd727a02a07709e25640165aba61f8dcd96f57ae9373d56a71f8e7c544359aa4552905ddbc1deb5d91ab1277fe9b589a2385fc92f538771d8e60eff3611285c674a9c389146ca458ba430452904894f86fdc2f358c94273f39924b4b0bb575293fffe581c37d7f74e7f608391912399f989b0f7ed5965a5ca769e5149529fc5dc80ba454db4ecafd21c95980019e0ea74916dd0910421de1f862ac8a423e62039217ac8fc9f0e938a9f93e742c803a9f5e643f9ec872732528b3ed2cf1fc218e6dae55957867dba1bb3f7e710ad00bf669c245f93cd2d39f83d649b82846323634c42612e0","image":"589a60fd78fb53173c31d2d3","username":"stephencaffey","displayname":"stephencaffey","email":"stephencaffey@tamu.edu","preferences":{"minimap":"left","element_snap":true,"show_grid":true},"access_code":"","consent_baseline":false,"activate_activated":true,"scholar_explorer":{"exploration_ids":[]},"maches":[],"followers":[],"following":[],"avatars":["589a60fd78fb53173c31d2d3"],"__v":0}`
    let a2Json = `{"_id":"5aa0528fd4d998961cb73154","created_on":"2018-03-07T20:58:55.725Z","last_modified":"2018-03-07T20:58:55.725Z","salt":"ecf854dcc4283ef3ec6f1bf624ddb9d0b5cc709e3dbd60375f3591ade17616a0","hash":"4684fc5e7f488cf1a0fdee83894b15d3c1b829f64a4644094f35e38ded8d38ee616c02c693a62801edb1a29b66a818d8d1ef23fa1eb3b39def8bdf01a8b97f68c944326bfc6045d2d42cbfba9eb5defb7b611e2fc8b9ebd31cf625c898d54867dcd0364a84df1384f502285e79e0048a306051aa624b733465918e2b3969d6391733e316ac3ac364977555837ec868c8afd7b99fa62effaab54e662a57b88e61dac61c3ddd2d9506ecb18761e9c58f6bd33edab36e804a08a0aa95a8070d5e0e2b1095fdf7781f2931f997330adfe6eef98ac4bf5f27934cf73a5b8455733beda12f0c6c93aa956ffcb1fd37d86cde276b21ed202697debf1ce7b897b1898f72a98f4812f1f8a1c5431d4d3a122f92f054409565226c7ee614956d3d04e84b5509f72d101ebc4cccea76df79264fb17bfc30e9c8e23491a50acfa76ab38b6e05546716560dfae92bcec0b1065729eec28f112f2c2924bf4f7c6f2b30fc8640a773f25f0dd0da36f0ed88b751eaa6b67366a0287c52bd1a966bb67ab9a90e3b7b7663617d0fc91463c307a147fbfa74644b7ba95a74136f8e9aa7f1768182b55ae07b4099fc59dda5afa74d97a026a0e28632f15ac8cfc6ad41a17e11942f2c63b7cf0d511b4c08497dd94383bd195b6ef5f2865e1e546308b4379b702fa740cb2d83229f90735fc9627634452daf0049eb0f042538df6beef6b261d2933b7adc","image":"589a60fd78fb53173c31d2d3","username":"zack.rosson@tamu.edu","displayname":"zack.rosson@tamu.edu","email":"zack.rosson@tamu.edu","activate_account_token":"11a7748d963eb9d4d81af45f42dca590234e1304","activate_account_expires":"2018-03-07T21:58:55.066Z","preferences":{"minimap":"left","element_snap":true,"show_grid":true},"access_code":"ENDS_101_SPRING2018","consent_baseline":true,"activate_activated":false,"maches":["5aa0a3e3d4d998961cb73292","5aa0aa41d4d998961cb732d4","5aa0b1d6d4d998961cb73341","5aa0bcf8d4d998961cb733d9","5aa0c3d0d4d998961cb733ea","5abd471d0a1634b97fd952e7"],"followers":[],"following":[],"avatars":["589a60fd78fb53173c31d2d3"],"__v":0}`;
    let a3Json = `{"_id":"5a77da87593b3cb72882918e","created_on":"2018-02-05T04:16:08.105Z","last_modified":"2018-02-05T04:16:08.105Z","salt":"00967f161bed2c62defef93ad0ffd3d1f0552b66fa15073029b87c881e6c8826","hash":"48e4e19c725aed9cb214e10601beecd68da2082550983525eb02da3864629eba7906b42c6c198ccb1cd4980ff838329d5c075953377f9ed6be5a9004091117e98b323eaf1d2499a9d5294b726837864d911980ee0b3315f9faa8a8107325564d03434f0f098074b1bc7b97cefc1d141c4a3d390db4f44d8a6e19c29dd46f35605aecd8e155c2acf184db911f07e9af3ff1c0349d28f5bc12ef7399212d754511c7d4b98836b2340e748e9abea547713fab88c4c1545909f6aca9fb8b5048889cfc831b50c224640dbe4a331312717cbe905d70cdaacbff46f9826ceb273d00c0d4f369554a8fe13a60ae7c633761d0fafb85a0e12a7fbcd05723b908a17868ec6cb7865089896826d936ae03d341429aaddfc1c0ee9d0ce7357369ebbf0cf31624c19f572eb5829704a64c2dee0146303eaf55f2524d637ee63c3958dea3ce0f479fa82918a2d9d86af626bcca91420c334d1f526f33eedb6555605bfa72729766d9af9eb0c9ee6e030573fffcfbcd4f7e9c5d15f3a12eec75f7d812d029e64c71d1b1f76522d6313c4e2f790599db63cde62c4fcf75b32237beb5b7f096ab0bdf35c0dc56e06a4da4e28c6c6212296489bfc8212ded3f5539e329991606c3c9bfbf892b265cd06acb9e81e2a19a3f8db6b1d09d7959c1f42fa77b5a7b70c91ea31fbb870e9c1fe4d8c63b2c61a08ca5b003f95c273dadcbaadcae6e3d9ced84","image":"589a60fd78fb53173c31d2d3","username":"Zac151","displayname":"Zac151","email":"zac151@tamu.edu","activate_account_token":"86f6c278fdeec2cb1a5216eab0572aedbc6ea2b4","activate_account_expires":"2018-02-05T05:16:07.339Z","preferences":{"minimap":"left","element_snap":true,"show_grid":true},"access_code":"ENDS_101_SPRING2018","consent_baseline":true,"activate_activated":false,"maches":["5a77daf7593b3cb7288291a3","5a7e01364c3053a25f798c50","5a821d9841dc8c6c6f6ab4c6","5aa16a7510d9d9891c10b0ae","5aa16f8810d9d9891c10b115","5aa2a2ccd4d998961cb748f5","5aa2d74c3723e88a1c6f49df","5aa2e82f3723e88a1c6f4cfa","5b0454b316825afe082dee61"],"followers":[],"following":[],"avatars":["589a60fd78fb53173c31d2d3"],"__v":0}`

    let accounts = [ JSON.parse(a1Json), JSON.parse(a2Json), JSON.parse(a3Json) ]
    let savePromises = accounts.map( (a) => {
      return new Promise( (resolve, reject) => {
        const newAcc = new Account(a);
        newAcc.save().then( (doc, e) => {
          if (e) { reject(e); }
          console.log("Live mache account inserted!");
          resolve(true);
        })
      })
    })
    Promise.all( savePromises ).then( (s) => {
      resolve(true);
    })
  })

}
