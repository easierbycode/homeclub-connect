// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.verifyEcho', {
    url: '/verify-echo',
    views: {
      'menuContent': {
        templateUrl: 'templates/verify-echo.html',
        controller: 'VerifyEchoCtrl'
      }
    }
  })

  .state('app.verifyHue', {
      url: '/verify-hue',
      views: {
        'menuContent': {
          templateUrl: 'templates/verify-hue.html',
          controller: 'VerifyHueCtrl'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.verifyNest', {
      url: '/verify-nest',
      views: {
        'menuContent': {
          templateUrl: 'templates/verify-nest.html',
          controller: 'VerifyNestCtrl'
        }
      }
    })
  .state('app.verifyScout', {
      url: '/verify-scout',
      views: {
        'menuContent': {
          templateUrl: 'templates/verify-scout.html',
          controller: 'VerifyScoutCtrl'
        }
      }
    })
    
  .state('app.verifyLeeo', {
      url: '/verify-leeo',
      views: {
        'menuContent': {
          templateUrl: 'templates/verify-leeo.html',
          controller: 'VerifyLeeoCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});
