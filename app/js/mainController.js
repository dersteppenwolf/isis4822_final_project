// create the controller and inject Angular's $scope
dataViz.controller('mainController', function($scope, $rootScope, $http, $log, $filter) {
  
    $scope.init = function() {
      $log.log("init - mainController");
    };

    $scope.init();

});
