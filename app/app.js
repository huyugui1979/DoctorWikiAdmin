'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.doctor',
    'myApp.question',
    'myApp.view2',
    'myApp.version'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/view2'});
    }]). constant('SERVER', {
        // Local server
        URL: 'http://113.31.89.205:3030'
        // Public Heroku server
        //url: 'https://ionic-songhop.herokuapp.com'
    })

