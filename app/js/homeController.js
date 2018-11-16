// create the controller and inject Angular's $scope
dataViz.controller('homeController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.init = function () {
    $log.log("init - homeController");
  }

  $scope.init();


});
