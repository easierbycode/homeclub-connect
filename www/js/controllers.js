var fb = new Firebase( 'https://homeclub-connect.firebaseio.com' );
var requestToken = "";
var accessToken = "";
var clientId = "829579eb-682c-4e44-b69b-d40df3ad9ab2";
var clientSecret = "OvjjBj81jV8JFSTE5swkhXjwA";

// TODO: remove this temp hack once login is in place
var currentUser = {
  _id: '5550f6f9f3b527688eea24de'
};

angular.module('starter.controllers', ['ngCordova'])

.factory('LatestGpsCoordinates', function() {
  
  var coords;
  
  return {
    get: function() { return coords },
    set: function( coords ) { coords = coords }
  };
  
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope, LatestGpsCoordinates) {
  
  $cordovaGeolocation.getCurrentPosition({}).then(function(position){
    alert( 'found GPS position: ' + position.coords.latitude + ', ' + position.coords.longitude );
    LatestGpsCoordinates.set( position.coords );
  },function(err){});
  
  $scope.playlists = [
    { title: 'Amazon Echo', id: 1, verificationPage: '/verify-echo' },
    { title: 'Nest Smoke Detector', id: 2, verificationPage: '/verify-nest' },
    { title: 'Phillips Hue', id: 3, verificationPage: '/verify-hue' },
    { title: 'Scout Alarm', id: 4 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams, $cordovaCapture, LatestGpsCoordinates) {
})

.controller('VerifyEchoCtrl', function($scope, $cordovaCapture) {
  
    $scope.record = function() {
        var options = { duration:10, quality:0 };
        
        $cordovaCapture.captureVideo(options).then(function( videoData ) {
          
          var amazonEchoData = { verifyDate: new Date().getTime() };
          if (LatestGpsCoordinates.get())  amazonEchoData.verifiedFromGpsPosition = LatestGpsCoordinates.get();
            
            // console.log( videoData );
          amazonEchoData.videoProof = videoData;
          fb.child( currentUser._id ).child('thirdPartyDevices').update( { amazonEcho: amazonEchoData } );
            
        }, function( err ) {})
    };
})

.controller('VerifyHueCtrl', function($scope, $http, $window) {
  // var resp = [{"id":"001788fffe09460a","internalipaddress":"192.168.1.6"}];
  // http://www.meethue.com/api/nupnp
  $scope.findBridge = function() {
    $http.get('/api/nupnp', {}).then(function(resp){
      
      var hueInternalIp = resp.data[0] && resp.data[0].internalipaddress;
      if ( hueInternalIp ) {
        
        var hueInternalApiUrl = 'http://' + hueInternalIp + '/api/';
        
        $http.post( hueInternalApiUrl, {devicetype:"homeclub_connect#mobile testuser"} ).then(function( hueResp ) {
          
          if ( hueResp.data[0] && hueResp.data[0].error ) {
            var errorText = hueResp.data[0].error.description;
            return alert(errorText);
          }
          
          if ( hueResp.data[0] && hueResp.data[0].success ) {
            var hueUsername = hueResp.data[0].success.username;
            
            $http.get(hueInternalApiUrl+hueUsername, {}).then(function( fullStateResp ) {
              alert( 'Found ' + Object.keys(fullStateResp.data.lights).length + ' lights with ' + Object.keys( fullStateResp.data.schedules ).length + ' schedules');
              fb.child( currentUser._id ).child('thirdPartyDevices').update( {phillipsHue: fullStateResp.data} );
            })
          }
        })
      } else {
        alert( "No bridge found.  Please ensure you're connected to the same Wi-Fi network." );
      }
    })
  }
})

.controller( 'VerifyNestCtrl', function( $cordovaInAppBrowser, $http, $location, $rootScope, $scope, LatestGpsCoordinates ) {
  
  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  
  $scope.nestData = {};
  
  $scope.login = function() {

        var options = {
          location: 'no',
          clearcache: 'yes',
          toolbar: 'no'
        };
        
        $cordovaInAppBrowser.open('https://home.nest.com/login/oauth2?client_id=829579eb-682c-4e44-b69b-d40df3ad9ab2&state=' + currentUser._id + new Date().getTime(), '_blank', options);
        
        $scope.getCodeFromUrl = function(e, event) { 
            if((event.url).startsWith("https://homeclub.us/auth/nest/callback")) {
                requestToken = $scope.requestToken = (event.url).split("code=")[1];
                $http({method: "post", url: "https://api.home.nest.com/oauth2/access_token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code" + "&code=" + requestToken })
                    .success(function(data) {
                      accessToken = $scope.accessToken = data.access_token;
                      alert( 'access token: ', accessToken );
                      // $location.path("/app");
                      
                      var ref = new Firebase('wss://developer-api.nest.com');
                      ref.auth(accessToken);
                      ref.on('value', function(snapshot) {

                        $scope.$apply(function(){
                          $scope.nestData = snapshot.val();
                        });
                        
                        var nestData = {
                          devices: (snapshot.val()).devices,
                          verifyDate: new Date().getTime()
                        }
                        if (LatestGpsCoordinates.get())  nestData.verifiedFromGpsPosition = LatestGpsCoordinates.get();
                        
                        fb.child( currentUser._id ).child('thirdPartyDevices').update( {nest: nestData} );
                      });
                    })
                    .error(function(data, status) {
                      alert("ERROR: " + data);
                    });

                $cordovaInAppBrowser.close();
            }
        }

        $rootScope.$on('$cordovaInAppBrowser:loadstart', $scope.getCodeFromUrl);
        $rootScope.$on('$cordovaInAppBrowser:loaderror', $scope.getCodeFromUrl);
    }
    
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }
  
})
