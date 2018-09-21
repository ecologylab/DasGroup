//1. If not authenticated then redirect to https://livemache.ecologylab.net/?sendBack=true

//2. In live mache perhaps at https://github.com/ecologylab/LiveMache/blob/master/web/src/public/js/ajaxLogin.js  we add the following function

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//3. In live mache we change https://github.com/ecologylab/LiveMache/blob/master/web/src/public/js/ajaxLogin.js to the following

var Login = {
    sendLogin: function()
    {
        event.preventDefault();
        var xmlhttp = new XMLHttpRequest();
        var url = "/login";
        var username = document.getElementsByName('username')[0].value;
        var password = document.getElementsByName('password')[0].value;
        let sendBack = getParameterByName('sendBack') || "false";
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
              if ( xmlhttp.response.sendBack == "true" ) { window.location.href = '/getToken'; }
                Login.completedRquest();
            }
            if (xmlhttp.readyState == 4 && xmlhttp.status == 400)
            {
                Login.onSignInFailure();
            }
        };
        xmlhttp.open("post", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        /* This is an .... interesting way of doing things..... */
        var data = 'username=' + window.encodeURIComponent(username) + '&password=' + window.encodeURIComponent(password) + '&ajax=' + window.encodeURIComponent("true") + '&sendBack=' + window.encodeURIComponent(sendBack);

        xmlhttp.send(data);
    },
    onSignInFailure: function(googleUser)
    {
        document.getElementById("error").innerHTML = "<b>Invalid username or password.</b>";
        console.log("fail!");
        setTimeout(Login.clearErrorText, 3000);
    },
    completedRquest: function()
    {
        location.reload();
    },
    clearErrorText: function()
    {
        document.getElementById("error").innerHTML = "";
        document.getElementsByName('password')[0].value = "";
    }
};



//4. In Live mache we change https://github.com/ecologylab/LiveMache/blob/master/nodejs/routes/users.js to the following

router.post('/login', function(req, res, next)
{
    const sendBack = req.header('X-sendBack') || false;
    var ajax = typeof req.body.ajax != "undefined" && req.body.ajax === "true" ? true : false;
    passport.authenticate('local', function(err, user, info)
    {
        if (err)
        {
            return next(err);
        }
        // Redirect if it fails
        if (!user)
        {
            req.flash('error', "Invalid username or password.");
            req.flash("type", "auth");
            //return error
            if (ajax)
                return res.send(400);
            else
                return res.redirect('/');
        }
        req.logIn(user, function(err)
        {
            if (err)
            {
                req.flash("type", "auth");
                req.flash('error', "Invalid username or password.");
                //return error
                if (ajax)
                    return res.send(400);
                else
                    return next("/");
            }
            // show message if it has not been activated
            if (!req.user.activate_activated)
            {
                req.flash('error', "Your account's email address has not been confirmed. Click <a href='/activate'>here</a> to resend the activation email.");
            }
            //return login was sucessful -- send user to dashboard if that is where they came from
            if (ajax) {
                if ( sendBack ) { res.status(200); return res.send({sendBack : true} ); }
                else {
                  return res.status(200).json({});
                }
            }
            else if(typeof req.session.returnTo != "undefined")
            {
                var returnTo = req.session.returnTo; //wtf is this
                delete req.session.returnTo; //...
                return res.redirect(returnTo);
            }
            else
                return res.redirect('/');
        });
    })(req, res, next);
});

//Add my token handler module to live mache
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


//6. In live mache we add the route getAuthToken (example url)

router.get('/getAuthToken', isAuthenticated, (req, res) => {
  let token = tokenHandler.generateToken(req.user),
      redirectUrl = 'https://livemache.ecologylab.net/g/prelog/' + token;
  res.redirect(redirectUrl)
})




//7 we can then add a hidden button / link e.g.
$('#visitDashboard').on('click', (el) => {
  el.preventDefault();
  window.open('/getToken')
})
