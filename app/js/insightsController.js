// create the controller and inject Angular's $scope
dataViz.controller('insightsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.init = function () {
    $log.log("init - insightsController");
  }

  $scope.init();


});
