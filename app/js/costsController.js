// create the controller and inject Angular's $scope
dataViz.controller('costsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.progressbar = ngProgressFactory.createInstance();
  $scope.progressbar.setHeight("5px");

  ////////////////////////////////
  // domains ( for labels)   
  $scope.years = []
  $scope.states = []
  $scope.sections = []

  ////////////////////////////////
  // data for cards  
  $scope.totalPopulation = 0
  $scope.totalCosts = 0
  $scope.totalCostPerPerson = 0


  ////////////////////////////////
  // crossfilter   
  $scope.cf = {}
  $scope.totalPopulationSum = {}
  $scope.totalCostsSum = {}

  $scope.dimYear = {}
  $scope.groupYear = {}

  $scope.dimStates = {}
  $scope.groupStates = {}

  //  Procedures
  $scope.dimSection = {}
  $scope.groupSection =  {}

  ////////////////////////////////
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
      v.anno = +v.anno
      v.code_depto = +v.code_depto
      v.code_seccion = +v.code_seccion
      //$log.log(v);
    });
    $log.log(d);

    $scope.cf = crossfilter(d);
    $scope.cf.onChange($scope.onCrossfilterChange);
    $scope.totalPopulationSum = $scope.cf.groupAll().reduceSum((d) => d.numero_personas_atendidas);
    $scope.totalCostsSum = $scope.cf.groupAll().reduceSum((d) => d.costo_procedimiento);

    $scope.dimYear = $scope.cf.dimension(function (d) { return d.anno || 0; });
    $scope.groupYear = $scope.dimYear.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

    $scope.dimStates = $scope.cf.dimension(function (d) { return d.code_depto || 0; });
    $scope.groupStates = $scope.dimStates.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

    //////////////
    //  Procedures
    $scope.dimSection = $scope.cf.dimension(function (d) { return d.code_seccion || 0; });
    $scope.groupSection = $scope.dimSection.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)


    //////////////
    //  providers
    $scope.dimProvider = $scope.cf.dimension(function (d) { return d.prestador || 0; });
    $scope.groupProvider = $scope.dimProvider.group().reduce(reduceAdd, reduceRemove, reduceInitial);

    //////////////
    //  administrators
    $scope.dimAdmin = $scope.cf.dimension(function (d) { return d.administradora || 0; });


    //////////////
    $scope.dimYear.filterAll()



    //////////////
    function reduceAdd(p, v) {
      //$log.log(p);
      //$log.log(v);
      ++p.count;
      p.costs += v.costo_procedimiento;
      p.people += v.numero_personas_atendidas;
      if (p.costs > 0 && p.people > 0) {
        p.costPerson = p.costs / p.people;
      } else {
        p.costPerson = 0;
      }
      return p;
    }

    function reduceRemove(p, v) {
      --p.count;
      p.costs -= v.costo_procedimiento;
      p.people -= v.numero_personas_atendidas;

      if (p.costs > 0 && p.people > 0) {
        p.costPerson = p.costs / p.people;
      } else {
        p.costPerson = 0;
      }
      return p;
    }

    function reduceInitial() {
      return { count: 0, costs: 0, people: 0, costPerson: 0 };
    }

    function orderValue(p) {
      return p.costPerson;
    }
    //////////////
  }



  $scope.loadData = function () {
    $log.log("loadData")
    d3.tsv('data/costs.tsv').then($scope.parseData)
  };


  $scope.onSelectYear = function (item, model) {
    $log.log("onSelectYear")
    //$log.log(item)
    //$log.log(model)
    if (item.code == -1) {
      $scope.dimYear.filterAll();
    } else {
      $scope.dimYear.filterExact(item.code);
    }
  };

  $scope.onSelectState = function (item, model) {
    $log.log("onSelectState")
    //$log.log(item)
    //$log.log(model)
    if (item.code == -1) {
      $scope.dimStates.filterAll();
    } else {
      $scope.dimStates.filterExact(item.code);
    }
  };



  $scope.onCrossfilterChange = function (eventType) {
    $log.log("onCrossfilterChange")
    $log.log(eventType)
    $scope.totalPopulation = $scope.totalPopulationSum.value()
    $scope.totalCosts = $scope.totalCostsSum.value()
    if ($scope.totalCosts > 0 && $scope.totalPopulation > 0) {
      $scope.totalCostPerPerson = $scope.totalCosts / $scope.totalPopulation;
    } else {
      $scope.totalCostPerPerson = 0;
    }

    $log.log("*** groupYear ")
    $scope.groupYear.top(Infinity).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });


    $log.log("*** groupStates top  ")
    $scope.groupStates.top(2).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });

  }

  /*
    $log.log("*** groupStates ")
    $scope.groupStates.top(Infinity).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });
    */

  /*
   

    $log.log("*** groupStates ")
    $log.log($scope.groupStates.all())

    $log.log("*** groupProvider ")
    $scope.groupProvider.top(Infinity).forEach(function (p, i) {
      //$log.log(p.key + ": " + p.value);
      $log.log(p);
    });

    const ratioGoodOnOutOfDate = $scope.groupStates.all().map((item, index) => {
      let ratio = {}
      ratio.key = item.key
      //ratio.value = quantityByCategory.all()[index].value / item.value
      ratio.value = item.costs / item.people
      return ratio
    })

    $log.log("*** ratioGoodOnOutOfDate ")
    $log.log(ratioGoodOnOutOfDate);
    */



  window.onresize = function () {
    //$log.log("onresize");
    $scope.width = window.innerWidth - $scope.margin.left - $scope.margin.right;
    return $scope.$apply();
  };


  $scope.init = function () {
    $log.log("init - costsController");
    $scope.loadDomains()
  }

  $scope.init();

});
