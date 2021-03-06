dataViz.directive('barChart', function ($parse, $log, $filter) {
    return {
        restrict: 'EA',
        scope: true,
        template: '',
        // https://stackoverflow.com/questions/20018507/angular-js-what-is-the-need-of-the-directive-s-link-function-when-we-already-ha
        link: function (scope, elem, attrs) {

            var NUM_TOP_ITEMS = 20

            scope.crossfilter = $parse(attrs.crossfilter);
            var dimension = $parse(attrs.dimension);
            var group = $parse(attrs.group);
            var domain = $parse(attrs.domain);

            scope.id = attrs.id
            scope.charttitle = attrs.charttitle
            scope.showall = JSON.parse(attrs.showall)
            scope.resolveaxislabel = false
            if(attrs.resolveaxislabel)  {
                scope.resolveaxislabel = JSON.parse(attrs.resolveaxislabel)
            }
            

            
            
            scope.dataset = []

            var xScale, yScale, yGridGen, xAxisGen, yAxisGen, barsGen;

            scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

            scope.svg = d3.select("#" + scope.id)
                .append("svg")
                .attr("id", scope.id + "-svg")
                //.attr("preserveAspectRatio", "xMinYMin meet")
                //.classed("svg-content", true)

            var margin = { top: 30, bottom: 5, right: 10, left: 40 }
            //var width = getDivWidth('.chart-container') - margin.left - margin.right
            var width = getDivWidth("#"+scope.id) - margin.left - margin.right

            var divH = getDivHeight("#"+scope.id)
            var height = divH - margin.top - margin.bottom;
          

            window.onresize = function () {
                //$log.log("onresize");
                //width = getDivWidth('.chart-container') - margin.left - margin.right;
                width = getDivWidth("#"+scope.id) - margin.left - margin.right;
                $log.log(width);  
                
                redrawChart();
                // return scope.$apply();
            };
            ////////////////
            scope.$watch(scope.crossfilter, function (newVal, oldVal) {
                //$log.log("watch crossfilter " + scope.id);
                if (newVal.onChange) {
                    scope.crossfilter = newVal
                    scope.crossfilter.onChange(scope.onCrossfilterChange);
                }
            });

            scope.$watch(dimension, function (newVal, oldVal) {
                //$log.log("watch dimension " + scope.id);
                if (newVal.filterExact) {
                    dimension = newVal
                }
            });

            scope.$watch(group, function (newVal, oldVal) {
                //$log.log("watch group " + scope.id);
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
                //$log.log("barChartDirective - onCrossfilterChange " + scope.id)
                //$log.log(eventType)
                if (scope.showall) {
                    var data = group.all()
                    data.forEach(d => {
                        d.label = labelFromDomain(d.key)
                    });
    
                    scope.dataset = data.sort( function (a, b) {
                        if (a.label > b.label) {
                          return 1;
                        }
                        if (a.label < b.label) {
                          return -1;
                        }
                        // a must be equal to b
                        return 0;
                      })
                } else {
                    scope.dataset = group.top(NUM_TOP_ITEMS)
                }

                if (!scope.initialized) {
                    render();
                } else {
                    redrawChart();
                }
            }

            ////////////////

            function xValue(d) {
                return d.key;
            }

            function yValue(d) {
                return d.value.costPerson
            }

            function tooltipValue(d) {
                return "<b>" + labelFromDomain(d.key) +
                    " ("+d.key+") </b>:<br>C/P: $" + $filter('megaNumber')(d.value.costPerson) +
                    ",   People: " + $filter('megaNumber')(d.value.people) +
                    ",  Costs: $" + $filter('megaNumber')(d.value.costs) 
                    
            }

            function labelFromDomain(d) {
                var label = d
                if (domain.length > 0) {
                    const items = domain.filter(word => word.code == d);
                    if (items.length > 0) {
                        label = items[0].label
                    } else {
                        $log.log("Not Foud: " + d)
                        $log.log(domain)
                        label = d
                    }

                }
                return label
            }

            // The x-accessor for the path generator; xScale o xValue.
            function X(d) {
                return xScale(xValue(d));
            }

            // The y-accessor for the path generator; yScale o yValue.
            function Y(d) {
                return yScale(yValue(d));
            }

            function getDivWidth(div) {
                var width = d3.select(div)
                    // get the width of div element
                    .style('width')
                    // take of 'px'
                    .slice(0, -2)
                // return as an integer
                return Math.round(Number(width))
            }

            function getDivHeight(div) {
                var width = d3.select(div)
                    // get the width of div element
                    .style('height')
                    // take of 'px'
                    .slice(0, -2)
                // return as an integer
                return Math.round(Number(width))
            }


            /**
             * update drawing parameters according to new data
             */
            function updateParameters() {
                //$log.log("updateParameters");
                
                xScale = d3.scaleBand()
                    .padding(0.2)
                    .rangeRound([margin.left, width])
                    .domain(scope.dataset.map(function (d) { return xValue(d); }))

                yScale = d3.scaleLinear()
                    .rangeRound([height - margin.bottom, margin.top])
                    .domain([0, d3.max(scope.dataset, function (d) { return yValue(d); })])
                    .nice()

                xAxis = d3.axisBottom(xScale)
                if(scope.resolveaxislabel){
                    xAxis.tickFormat(labelFromDomain)
                }
                
                yAxis = d3.axisLeft(yScale)
                    .ticks(5).tickPadding(10)
                    .tickFormat(d => ( "$ " +$filter('megaNumber')(d) + "  "    )   );       
                
                xAxisGen = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(xAxis)
                    .selectAll("text")
                    // .attr("y", 15)
                    // .attr("x", 0)
                    // .attr("dy", ".35em")
                    // .attr("transform", "rotate(25)")
                    // .style("text-anchor", "start")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-25)" 
                        });

                yAxisGen = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(yAxis)
                    .call(g => g.select(".domain").remove())
                
                yGridGen = g => g
                    .call(d3.axisLeft(yScale).ticks(5).tickSize(-width)
                        .tickFormat(""))

                barsGen = g => g
                    .selectAll()
                    .data(scope.dataset)
                    .enter()
                    .append("rect")
                    //.style("mix-blend-mode", "multiply")
                    .attr("class", function (d) { return Boolean(d.selected) ? "barSelected" : "bar" })
                    .attr("x", X)
                    .attr("y", Y)
                    .attr("width", xScale.bandwidth())
                    .attr("height", function (d) { return height - Y(d) - margin.bottom })
                    .on("mouseenter", handleMouseEnter)
                    .on("mouseleave", handleMouseLeave)
                    //.on("mousemove", handleMouseMove)
                    //.on("mouseout", handleMouseOut)
                    .on("click", handleMouseClick)
                    .exit().remove();
            }

            function redrawChart() {
                //$log.log("redrawChart");
                updateParameters();
                try {
                    if (scope.showall) {
                        var t = scope.svg.transition();

                        t.select("g.y.axis")
                        .duration(500)
                        .call(yAxisGen);

                        t.select("g.grid")
                            .duration(500)
                            .call(yGridGen);

                        scope.svg.selectAll(".bar, .barSelected")
                            .transition()
                            .duration(750)
                            //.attr("x", X)
                            .attr("y", Y)
                            .attr("height", function (d) { return height - Y(d) - margin.bottom })
                    }else{
                        scope.svg.selectAll(".bar,.barSelected").remove()
                        scope.svg.selectAll(".bars").call(barsGen)
                        var t = scope.svg.transition();
                        t.select("g.x.axis")
                        .duration(500)
                        .call(xAxisGen);
                    }
                    
                }
                catch(err) {
                   // $log.error(err)
                }
            }



            function render() {
                //$log.log("render");
                updateParameters()

                scope.svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


                scope.svg.append("text")
                    .attr("class", "chartTitle")
                    .attr("x", (width / 2))
                    .attr("y", 0 + (margin.top / 2))
                    .attr("text-anchor", "middle")
                    .text(scope.charttitle)

                scope.svg.append("g")
                    .attr("class", "x axis")
                    .call(xAxisGen);

                scope.svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxisGen);

                // add the Y gridlines
                scope.svg.append("g")
                    .attr("class", "grid")
                    .call(yGridGen)

                scope.svg.append("g")
                    .attr("class", "bars")
                    .call(barsGen)
                
                scope.initialized = true;
            }

            function handleMouseEnter(d, i) {
                //$log.log("handleMouseEnter "+ scope.id);
                scope.tooltip.style("left", d3.event.pageX - 80 + "px")
                    .style("top", d3.event.pageY - 80 + "px")
                    .style("display", "inline-block")
                    .html(tooltipValue(d));
                if (!Boolean(d.selected)) {
                    d3.select(this).attr("class", "barHover")
                }
                //dimension.filterExact(d.key);
            }

            function handleMouseLeave(d, i) {
                //$log.log("handleMouseLeave "+ scope.id);
                scope.tooltip.style("display", "none");
                //$log.log(Boolean(d.selected))
                //$log.log(scope.dataset)
                if (!Boolean(d.selected)) {
                    d3.select(this).attr("class", "bar")
                }
                //dimension.filterAll();
            }

            function handleMouseClick(d, i) {
                //$log.log("handleMouseClick "+ scope.id);
                if (!Boolean(d.selected)) {
                    d.selected = true;
                    d3.select(this).attr("class", "barSelected")
                    //$log.log(scope.dataset)
                    //dimension.filterExact(d.key);
                } else {
                    d.selected = false
                }

                const selectedItems = scope.dataset.filter(i => Boolean(i.selected)).map(a => a.key);
                //$log.log(selectedItems)
                if (selectedItems.length > 0) {
                    dimension.filter(function (d) {
                        //$log.log("filter")
                        //$log.log(d +" : "+selectedItems.includes(d))
                        return selectedItems.includes(d);
                    });
                } else {
                    dimension.filterAll();
                }
            }

            scope.$on('clearFilter', function(event, data){
                if(dimension.hasCurrentFilter()){
                    //$log.log("on clearFilter "+ scope.id);
                    scope.dataset.forEach(function(d){
                        d.selected = false
                    })
                    scope.svg.selectAll("rect.barSelected").attr("class", "bar")
                    dimension.filterAll();
                }
            })

        }
    };
});






