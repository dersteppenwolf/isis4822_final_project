// create the controller and inject Angular's $scope
dataViz.controller('costsController', function (
  $scope, $interval, $rootScope, $http, $log, $filter, ngProgressFactory) {

  $scope.progressbar = ngProgressFactory.createInstance();
  $scope.progressbar.setHeight("5px");

  $scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

  ////////////////////////////////
  // domains ( for labels)   
  $scope.years = []
  $scope.states = []
  $scope.sections = []
  $scope.administrators = []
  $scope.providers = [] 

  $scope.sisben = [] 
  $scope.regime = [] 
  $scope.chapter = [] 
  $scope.group = [] 
  $scope.subgroup = [] 

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

  

  //  administrators
  $scope.dimAdministrators = {}
  $scope.groupAdministrators=  {}

  $scope.dimProviders = {}
  $scope.groupProviders=  {}

  $scope.dimSisben= {}
  $scope.groupSisben=  {}

  $scope.dimRegime= {}
  $scope.groupRegime =   {}

  //  Procedures
  $scope.dimSection = {}
  $scope.groupSection =  {}

  $scope.dimChapter = {}
  $scope.groupChapter=  {}

  $scope.dimGroup= {}
  $scope.groupGroup=  {}

  $scope.dimSubgroup= {}
  $scope.groupSubgroup =  {}


  
  

  ////////////////////////////////
  $scope.loadDomains = function () {
    $log.log("loadDomains");

    $scope.tooltip.style("left", window.innerWidth / 2 - 80 + "px")
                    .style("top", window.innerHeight / 2- 80 + "px")
                    .style("display", "inline-block")
                    .html('<div style="margin:30px; padding:10px" >Loading 200k rows... </div>');

    $http.get('data/domains.json').
      then(function (response) {
        var data = response.data;
        //$log.log(data);
        $scope.years = data.years
        $scope.states = data.states
        $scope.sections = data.sections
        $scope.administrators = data.administrators
        $scope.providers = data.providers 
        
        $scope.sisben = data.sisben 
        $scope.regime = data.regime 
        $scope.chapter = data.chapter 
        $scope.group = data.group 
        $scope.subgroup = data.subgroup 
        
        

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
    $log.log(d[0]);

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
    //  administrators / providers
    $scope.dimAdministrators = $scope.cf.dimension(function (d) { return d.code_admin || 0; });
    $scope.groupAdministrators = $scope.dimAdministrators.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

    $scope.dimProviders = $scope.cf.dimension(function (d) { return d.code_prestador || 0; });
    $scope.groupProviders = $scope.dimProviders.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

    $scope.dimSisben = $scope.cf.dimension(function (d) { return d.code_sisben || 0; });
    $scope.groupSisben = $scope.dimSisben.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)
    
    $scope.dimRegime = $scope.cf.dimension(function (d) { return d.code_regimen || 0; });
    $scope.groupRegime = $scope.dimRegime.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

    //////////////
    //  Procedures
    $scope.dimSection = $scope.cf.dimension(function (d) { return d.code_seccion || 0; });
    $scope.groupSection = $scope.dimSection.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)
    
    $scope.dimChapter = $scope.cf.dimension(function (d) { return d.code_capitulo || 0; });
    $scope.groupChapter = $scope.dimChapter.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)
    
    $scope.dimGroup = $scope.cf.dimension(function (d) { return d.code_grupo || 0; });
    $scope.groupGroup = $scope.dimGroup.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)
    
    $scope.dimSubgroup = $scope.cf.dimension(function (d) { return d.code_subgrupo || 0; });
    $scope.groupSubgroup = $scope.dimSubgroup.group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(orderValue)

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
    $scope.tooltip.style("display", "none");
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
      $scope.groupStates.all().forEach(function(v){
        v.selected = false;
        //$log.log(v)
      })
      $scope.dimStates.filterAll();
    } else {
      $scope.dimStates.filterAll();
      $scope.groupStates.all().forEach(function(v){
        if(v.key == item.code){
          v.selected = true;
        }else{
          v.selected = false;
        }
        //$log.log(v)
      })
      $scope.dimStates.filterExact(item.code); 
    }
  };


  $scope.onCrossfilterChange = function (eventType) {
    $log.log("onCrossfilterChange - costsController")
    // $log.log(eventType)
    
    $scope.totalPopulation = $scope.totalPopulationSum.value()
    $scope.totalCosts = $scope.totalCostsSum.value()

    if ($scope.totalCosts > 0 && $scope.totalPopulation > 0) {
      $scope.totalCostPerPerson = $scope.totalCosts / $scope.totalPopulation;
    } else {
      $scope.totalCostPerPerson = 0;
    }
    $scope.$apply();
  }

  
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
