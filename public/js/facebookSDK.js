window.fbAsyncInit = function() {
  FB.init({
    appId: '2190124001312462',
    cookie: true,
    xfbml: true,
    version: 'v3.1'
  });

  FB.login(function(response)
  {
      console.log(response.status);
      if (response.status === 'connected')
      {
          console.log(response.authResponse.accessToken);
          // FacebookLogin.sendLogin(response.authResponse.accessToken);
      }
  });


};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
