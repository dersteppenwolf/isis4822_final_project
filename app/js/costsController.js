// create the controller and inject Angular's $scope
dataViz.controller('costsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.progressbar = ngProgressFactory.createInstance();
  $scope.progressbar.setHeight("5px");

  $scope.years = []
  $scope.states = []

  $scope.margin = { top: 20, right: 40, bottom: 10, left: 20 }
  $scope.width = 800


  $scope.loadDomains = function () {
    $log.log("loadDomains");
    $http.get('data/domains.json').
      then(function (response) {
        var data = response.data;
        //$log.log(data);
        $scope.years = data.years
        $scope.states = data.states

        let totalPeople = 0
        let totalCosts = 0
        $scope.years.forEach(function (v) {
          totalPeople += v.numero_personas_atendidas
          totalCosts += v.costo_procedimiento
        });

        $scope.years.unshift({
          "code": -1,
          "label": "All",
          "costo_procedimiento": totalCosts,
          "numero_personas_atendidas": totalPeople,
          "costo_proc_usuario": totalCosts / totalPeople
        });

        $scope.states.unshift({
          "code": -1,
          "label": "All",
          "costo_procedimiento": totalCosts,
          "numero_personas_atendidas": totalPeople,
          "costo_proc_usuario": totalCosts / totalPeople
        });

        $scope.years.selected = $scope.years[0]
        $scope.states.selected = $scope.years[0]

        //$log.log($scope.years);
        //$log.log($scope.states);
      });
  };


  $scope.onSelectYear = function (item, model){
    $log.log("onSelectYear")
    $log.log(item)
    $log.log(model)
  };

  $scope.onSelectState = function (item, model){
    $log.log("onSelectState")
    $log.log(item)
    $log.log(model)
  };


  window.onresize = function () {
    //$log.log("onresize");
    $scope.width = window.innerWidth - $scope.margin.left - $scope.margin.right;
    //$log.log($scope.width);
    return $scope.$apply();
  };


  $scope.init = function () {
    $log.log("init - costsController");
    $scope.loadDomains()
    //$scope.loadTree()
  }






  $scope.init();



});
