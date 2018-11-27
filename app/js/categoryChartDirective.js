dataViz.directive('categoryChart', function ($parse, $log, $filter) {
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

            scope.dataset = []

            var xScale, yScale, xGridGen, xAxisGen, yAxisGen, barsGen, bars;

            scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

            scope.svg = d3.select("#" + scope.id)
                .append("svg")
                .attr("id", scope.id + "-svg")

            var margin = { top: 30, bottom: 3, right: 10, left: 10 }
            var width = getDivWidth("#"+scope.id) - margin.left - margin.right

            var divH = getDivHeight("#"+scope.id)
            var height = divH - margin.top - margin.bottom;

            window.onresize = function () {
                $log.log("onresize");
                //width = getDivWidth('.chart-container') - margin.left - margin.right;
                width = getDivWidth("#"+scope.id) - margin.left - margin.right;
                $log.log(width);  
                redrawChart();
                // return scope.$apply();
            };
            ////////////////
            scope.$watch(scope.crossfilter, function (newVal, oldVal) {
                $log.log("watch crossfilter " + scope.id);
                if (newVal.onChange) {
                    scope.crossfilter = newVal
                    scope.crossfilter.onChange(scope.onCrossfilterChange);
                }
            });

            scope.$watch(dimension, function (newVal, oldVal) {
                $log.log("watch dimension " + scope.id);
                if (newVal.filterExact) {
                    dimension = newVal
                }
            });

            scope.$watch(group, function (newVal, oldVal) {
                $log.log("watch group " + scope.id);
                if (newVal.all) {
                    group = newVal
                    scope.onCrossfilterChange("load")
                }
            });

            scope.$watch(domain, function (newVal, oldVal) {
                $log.log("watch domain " + scope.id);
                if (newVal) {
                    domain = newVal
                }
            });

            

            scope.onCrossfilterChange = function (eventType) {
                $log.log("horizontalBarChartDirective - onCrossfilterChange " + scope.id)
                //$log.log(eventType)
                var data = []
                if (scope.showall) {
                    data = group.all()
                } else {
                    data = group.top(NUM_TOP_ITEMS)
                }

                data.forEach(d => {
                    d.label =  labelFromDomain(d.key)
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
                  }).reverse()

                if (!scope.initialized) {
                    render();
                } else {
                    redrawChart();
                }
            }

            ////////////////
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
                        $log.log("Not Found: " + d)
                        $log.log(domain)
                        label = d
                    }
                }
                return jsUcfirst( label.toLowerCase() )
            }

            function jsUcfirst(string) { 
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function yValue (d) {
                return d.key;
            }

            function xValue(d) {
                return d.value.costPerson
            }

            function X(d) {
                return xScale(xValue(d));
            }

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
                $log.log("updateParameters");
                
                yScale  = d3.scaleBand()
                    .padding(0.4)
                    .rangeRound([height, margin.top])
                    .domain(scope.dataset.map(function (d) { return yValue(d); }))

                xScale = d3.scaleLinear()
                    .rangeRound([margin.left, width])
                    .domain([0, d3.max(scope.dataset, function (d) { return xValue(d); })])
                    .nice()

                xAxis = d3.axisBottom(xScale).ticks(5)
                                
                //yAxis = d3.axisLeft(yScale).tickFormat("")
                                    
                xAxisGen = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(xAxis)
                
                // xGridGen = g => g
                //     .call(d3.axisTop(xScale).ticks(5).tickSize(-height- margin.bottom)
                //         .tickFormat(""))     

                // yAxisGen = g => g
                //     .attr("transform", `translate(${margin.left},0)`)
                //     .call(yAxis)
                //     .call(g => g.select(".domain").remove())

                barsGen = g => {
                    bars = g.selectAll()
                    .data(scope.dataset)
                    //.enter()
                    .enter().append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .attr("class", "bar")
                    .on("mouseenter", handleMouseEnter)
                    .on("mouseleave", handleMouseLeave)
                    .on("click", handleMouseClick)

                    bars.append("rect")
                        .attr("class",  "categoryBack")
                        //.attr("x", X )
                        .attr("y", function (d) {   return Y(d)  - yScale.bandwidth() * 0.3   })
                        .attr("height", yScale.bandwidth() * 1.25)
                        .attr("width", function (d) { return  xScale(xScale.domain()[1] ) -margin.left - margin.right  } )
                        .exit().remove()
                    
                    bars.append("rect")
                        .attr("class",  "categoryTotal")
                        .attr("y", function (d) {   return Y(d)  + yScale.bandwidth() * 0.9   })
                        .attr("height", 2)
                        .attr("width", function (d) { return  xScale(xScale.domain()[1] ) -margin.left - margin.right  } )
                        .exit().remove()
                    
                    bars.append("rect")
                        .attr("class", function (d) { return Boolean(d.selected) ? "categorySelected" : "category" })
                        .attr("y", function (d) {   return Y(d)  + yScale.bandwidth() * 0.9   })
                        .attr("height", 2)
                        .attr("width", function (d) { return  X(d)  -margin.left - margin.right  } )
                        .exit().remove()
    
                    bars.append("text")
                        .attr("class", "categoryLabel") 
                        .attr("y", function (d) {   return Y(d)  + yScale.bandwidth() * 0.55    })
                        //.attr("x", function (d) {   return margin.left    })
                        .attr("width", function (d) { return  X(d) - margin.left - margin.right  } )
                        .text(function (d) { return labelFromDomain(d.key) ; })
                }
            }

            function redrawChart() {
                $log.log("redrawChart");
                updateParameters();
                var t = scope.svg.transition();

                t.select("g.x.axis")
                    .duration(750)
                    .call(xAxisGen);

                // t.select("g.y.axis")
                //     .duration(500)
                //     .call(yAxisGen);

                // t.select("g.grid")
                //     .duration(500)
                //     .call(xGridGen);

                // t.selectAll("g.bar,g.barSelected")
                //     .duration(500)
                //     .attr("y", Y )
                //     .attr("height", yScale.bandwidth())
                //     .attr("width", function (d) { return  X(d) - margin.left - margin.right  } )
                //     .call(barsGen)

                scope.svg.selectAll(".bar").remove()
                scope.svg.selectAll(".barSelected").remove()
                scope.svg.selectAll(".bars").call(barsGen)
            }



            function render() {
                $log.log("render");
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

                // scope.svg.append("g")
                //     .attr("class", "y axis")
                //     .call(yAxisGen);

                // add the Y gridlines
                // scope.svg.append("g")
                //     .attr("class", "grid")
                //     .call(xGridGen)

                scope.svg.append("g")
                    .attr("class", "bars")
                    .call(barsGen)

                

                

                scope.initialized = true;
            }

            function handleMouseEnter(d, i) {
                //$log.log("handleMouseEnter "+ scope.id);
                scope.tooltip.style("left", d3.event.pageX - 80 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html(tooltipValue(d));
                if (!Boolean(d.selected)) {
                    d3.select(this).selectAll("rect.categoryBack").style("fill", "rgba(0, 0, 0 ,0.1)")
                    //d3.select(this).selectAll("text").attr("class", "valueOver")
                }
                //dimension.filterExact(d.key);
            }

            function handleMouseLeave(d, i) {
                //$log.log("handleMouseLeave "+ scope.id);
                scope.tooltip.style("display", "none");
                //$log.log(Boolean(d.selected))
                //$log.log(scope.dataset)
                if (!Boolean(d.selected)) {
                    d3.select(this).selectAll("rect.categoryBack").style("fill" , "rgba(255, 255, 255, 0.5)")
                    //d3.select(this).selectAll("text").attr("class", "value")
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

        }
    };
});






