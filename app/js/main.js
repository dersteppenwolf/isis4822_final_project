angular.module('d3', [])
  .factory('d3Service', [function(){
    var d3;
    // insert d3 code here
    return d3;
  }]);
	
var dataViz = angular.module('dataViz', [ 'ngRoute', 'angular-loading-bar', 
'ui.bootstrap' ,'d3', 'ngProgress' ]);

	// configure our routes
	dataViz.config(function($routeProvider) {
		$routeProvider

			.when('/', {
				templateUrl : 'pages/home.html',
				controller  : 'homeController'
			})

			.when('/home', {
				templateUrl : 'pages/home.html',
				controller  : 'homeController'
			})

			.when('/patients', {
				templateUrl : 'pages/patients.html',
				controller  : 'patientsController'
			})

			.when('/costs', {
				templateUrl : 'pages/costs.html',
				controller  : 'costsController'
			})

			.when('/insights', {
				templateUrl : 'pages/insights.html',
				controller  : 'insightsController'
			})

			.when('/about', {
				templateUrl : 'pages/about.html',
				controller  : 'aboutController'
			})

			.otherwise({
				redirectTo: 'pages/home.html'
			});;
	})
	
