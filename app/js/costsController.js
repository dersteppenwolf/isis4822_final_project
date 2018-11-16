// create the controller and inject Angular's $scope
dataViz.controller('costsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.progressbar = ngProgressFactory.createInstance();
  $scope.progressbar.setHeight("5px");

  $scope.years = []
  $scope.states = []
  $scope.sections = []

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
        $scope.sections = data.sections

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
      })
      .then($scope.loadData);
  };


  $scope.parseData = (d) => {
    $log.log("parseData");
    d.forEach(function (v) {
      //v.anio = $scope.parseYear(v.anio)
      v.costo_procedimiento = +v.costo_procedimiento
      v.numero_personas_atendidas = +v.numero_personas_atendidas
      //$log.log(v);
    });
    $log.log(d);
    var cf = crossfilter(d);
    var dimAdmin = cf.dimension(function (d) { return d.administradora || 0; });
    var dimYear = cf.dimension(function (d) { return d.anno || 0; });
    var dimProvider = cf.dimension(function (d) { return d.prestador || 0; });
    var dimStates = cf.dimension(function (d) { return d.code_depto || 0; });


    

    
    


    var groupStates = dimStates.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    var groupProvider = dimProvider.group().reduce(reduceAdd, reduceRemove, reduceInitial);

    function reduceAdd(p, v) {
      //$log.log(p);
      //$log.log(v);
      ++p.count;
      p.costs += v.costo_procedimiento;
      p.people += v.numero_personas_atendidas;
      return p;
    }

    function reduceRemove(p, v) {
      --p.count;
      p.costs -= v.costo_procedimiento;
      p.people -= v.numero_personas_atendidas;
      return p;
    }

    function reduceInitial() {
      return { count: 0, costs: 0, people:0 };
    }

    groupStates.top(Infinity).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });

    groupProvider.top(Infinity).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });
  }

  $scope.loadData = function () {
    $log.log("loadData")
    d3.tsv('data/costs.tsv').then($scope.parseData)
  };







  $scope.onSelectYear = function (item, model) {
    $log.log("onSelectYear")
    $log.log(item)
    $log.log(model)
  };

  $scope.onSelectState = function (item, model) {
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
