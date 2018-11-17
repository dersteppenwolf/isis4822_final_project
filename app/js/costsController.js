// create the controller and inject Angular's $scope
dataViz.controller('costsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.progressbar = ngProgressFactory.createInstance();
  $scope.progressbar.setHeight("5px");

  $scope.years = []
  $scope.states = []
  $scope.sections = []


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

  ////////////////////////////////
  $scope.chart = []

  $scope.margin = { top: 20, right: 40, bottom: 10, left: 20 }
  $scope.width = 800


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

    $scope.dimProvider = $scope.cf.dimension(function (d) { return d.prestador || 0; });
    $scope.groupProvider = $scope.dimProvider.group().reduce(reduceAdd, reduceRemove, reduceInitial);

    var dimAdmin = $scope.cf.dimension(function (d) { return d.administradora || 0; });


    //////////////
    $scope.dimYear.filterAll()



    //////////////
    function reduceAdd(p, v) {
      //$log.log(p);
      //$log.log(v);
      ++p.count;
      p.costs += v.costo_procedimiento;
      p.people += v.numero_personas_atendidas;
      p.costPerson = p.costs / p.people;
      return p;
    }

    function reduceRemove(p, v) {
      --p.count;
      p.costs -= v.costo_procedimiento;
      p.people -= v.numero_personas_atendidas;
      p.costPerson = p.costs / p.people;
      return p;
    }

    function reduceInitial() {
      return { count: 0, costs: 0, people: 0 };
    }

    function orderValue(p) {
      return p.costPerson;
    }
    //////////////
    $log.log("maxYear")

    let minYear = d3.min($scope.groupYear.all(), (d) => d.key)
    let maxYear = d3.max($scope.groupYear.all(), (d) => d.key)

    var xScale = d3.scaleBand()
      .domain(minYear, maxYear)
      .rangeRound([0, 500]) 
      .padding(0.2).round(true); 

      /*
    var xs = d3.scaleTime()
    .domain([new Date(minYear - 1, 0, 1), new Date(maxYear, 0, 1)])
    .rangeRound([0, 500]) 
*/

    var barrioBarChart = barChart()
      .width(400)
      .height(250)
      //.xTicks(d3.timeYear.every(1))
      .xScale(xScale)
      .x(function (d) { return d.key; })
      .y(function (d) { 
        return d.value.costPerson 
      });

    d3.select("#year-chart")
      .datum($scope.groupYear.all())
      .call(barrioBarChart)
      .select(".x.axis")
      .selectAll(".tick text")
      .attr("transform", "rotate(-90) translate(-10, -13)");

    

      /*
    $scope.charts = [

      barChart()
        .dimension($scope.dimYear)
        .group($scope.groupYear)
        .round(d3.timeYear.round)
        .xScale(d3.scaleTime()
          .domain([new Date(minYear - 1, 0, 1), new Date(maxYear, 0, 1)])
          .rangeRound([0, 500]))
        .xTicks(d3.timeYear.every(1))
        .yAttrib("costPerson")
        .renderAll($scope.renderAll)

    ];
    */

    // $scope.chart = d3.selectAll('.chart').data($scope.charts);






    //$scope.renderAll();


  }

  // Renders the specified chart or list.
  $scope.render = function (method) {
    $log.log("render")
    $log.log(method)
    d3.select(this).call(method);
  }

  // // Whenever the brush moves, re-rendering everything.
  $scope.renderAll = function () {
    $log.log("renderAll")
    $scope.chart.each($scope.render);
  };


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
