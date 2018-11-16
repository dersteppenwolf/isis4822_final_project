// create the controller and inject Angular's $scope
dataViz.controller('navController', function($scope, $anchorScroll, $rootScope, $http, $log, $filter) {
   
    $scope.init = function() {
      $log.log("init - navController");

    };

    $scope.init();

    $scope.scrollTo = function (id) {
      $anchorScroll(id);  
    }


});
