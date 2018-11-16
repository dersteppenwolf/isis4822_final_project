// create the controller and inject Angular's $scope
dataViz.controller('patientsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.init = function () {
    $log.log("init - patientsController");
  }

  $scope.init();


});
