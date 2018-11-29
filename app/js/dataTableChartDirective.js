dataViz.directive('datatableChart', function ($parse, $log, $filter) {
    return {
        restrict: 'EA',
        scope: true,
        template: ` 
            <div  class="chartTitle">
                {{charttitle}} 
            </div>
            <div class="chartSubTitle" >
            {{selectedItem.label}} 
             </div>
            <div ui-grid="gridOptions" ui-grid-selection 
                class="chart-container-table grid table"></div>
        `,

        link: function (scope, elem, attrs) {

            var NUM_TOP_ITEMS = 45

            scope.crossfilter = $parse(attrs.crossfilter);
            var dimension = $parse(attrs.dimension);
            var group = $parse(attrs.group);
            var domain = $parse(attrs.domain);

            scope.id = attrs.id
            scope.charttitle = attrs.charttitle
            scope.showall = JSON.parse(attrs.showall)

            scope.gridOptions = {
                enableRowSelection: true,
                enableSelectAll: false,
                enableRowHeaderSelection: false,
                selectionRowHeaderWidth: 35,
                rowHeight: 30,
                showGridFooter:true, showColumnFooter:false
            };
            scope.gridOptions.multiSelect = false;


            scope.gridOptions.columnDefs = [
                { name: 'key', displayName: 'CUPS'},
                { name: 'label', displayName: 'Name' , cellTooltip:true , width: '50%', cellClass:'tableContent' },
                { name: 'value.costPerson', displayName: 'Cost per Person' , type:'number' },
                { name: 'value.people', displayName: 'People Served', type:'number'  },
                { name: 'value.costs', displayName: 'Total Costs' , type:'number' }
              ];

            scope.gridOptions.onRegisterApi = function (gridApi) {
                //$log.log("onRegisterApi : " )
                scope.gridApi = gridApi;
                
                scope.gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                    //scope.selectItem(row.entity); 
                    if( scope.gridApi.selection.getSelectedCount()  > 0) {
                        //$log.log("selectItem : " )
                        //$log.log( row.entity)
                        scope.selectedItem = row.entity
                        dimension.filterExact(row.entity.key); 
                    }else{
                        //$log.log("none selected" )
                        scope.selectedItem = {label:""}
                        dimension.filterAll();
                    }
                });
            };

            scope.$on('clearFilter', function(event, data){
                if(dimension.hasCurrentFilter()){
                    $log.log("on clearFilter "+ scope.id);
                    scope.gridApi.selection.clearSelectedRows()
                    scope.selectedItem = {label:""}
                    dimension.filterAll();
                }
            })

            
                        

            window.onresize = function () {
               // $log.log("onresize - data-table-chart  ");
                redrawChart();
            };
            ////////////////
            scope.$watch(scope.crossfilter, function (newVal, oldVal) {
                //$log.log("data-table-chart  watch crossfilter " + scope.id);
                if (newVal.onChange) {
                    scope.crossfilter = newVal
                    scope.crossfilter.onChange(scope.onCrossfilterChange);
                }
            });

            scope.$watch(dimension, function (newVal, oldVal) {
                //$log.log("data-table-chart  watch dimension " + scope.id);
                if (newVal.filterExact) {
                    dimension = newVal
                }
            });

            scope.$watch(group, function (newVal, oldVal) {
                //$log.log("data-table-chart  watch group " + scope.id);
                if (newVal.all) {
                    group = newVal
                    scope.onCrossfilterChange("load")
                }
            });

            scope.$watch(domain, function (newVal, oldVal) {
                //$log.log("watch domain " + scope.id);
                if (newVal) {
                    domain = newVal
                }
            });

            



            scope.onCrossfilterChange = function (eventType) {
                //$log.log("dataTableChartDirective - onCrossfilterChange " + scope.id)
                //$log.log(eventType)
                var data = []
                if (scope.showall) {
                    //data = group.all()
                    data = group.top(Infinity)
                } else {
                    data = group.top(NUM_TOP_ITEMS)
                }

                var rows = []
                data.forEach(d => {
                    if( !(d.value.costPerson == 0 && d.value.people == 0 && d.value.costs == 0 ) ){
                        d.label = labelFromDomain(d.key)
                        rows.push(d)
                    }                    
                });

                //$log.log(data)
                scope.gridOptions.data = rows;
                redrawChart();
            }

            function labelFromDomain(d) {
                var label = d
                if (domain.length > 0) {
                    const items = domain.filter(word => word.code == d);
                    if (items.length > 0) {
                        label = items[0].label
                    } else {
                        //$log.log("Not Found: " + d)
                        //$log.log(domain)
                        label = d
                    }
                }
                return jsUcfirst(label.toLowerCase())
            }

            function jsUcfirst(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function redrawChart() {
                try {
                    //$log.log("redrawChart");
                    scope.gridApi.core.refresh();
                }
                catch(err) {
                    $log.error(err)
                }
            }




        }
    };
});






