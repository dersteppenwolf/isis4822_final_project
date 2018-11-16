// create the controller and inject Angular's $scope
dataViz.controller('aboutController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.init = function () {
    $log.log("init - aboutController");
  }

  $scope.init();


});
