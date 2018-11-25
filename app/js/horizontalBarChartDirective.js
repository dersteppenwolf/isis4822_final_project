dataViz.directive('horizontalBarChart', function ($parse, $log, $filter) {
    return {
        restrict: 'EA',
        scope: true,
        template: '',
        // https://stackoverflow.com/questions/20018507/angular-js-what-is-the-need-of-the-directive-s-link-function-when-we-already-ha
        link: function (scope, elem, attrs) {

            var NUM_TOP_ITEMS = 10
            const HEIGHT = 200

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

            var xScale, yScale, xGridGen, xAxisGen, yAxisGen, barsGen;

            scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

            scope.svg = d3.select("#" + scope.id)
                .append("svg")
                .attr("id", scope.id + "-svg")

            var margin = { top: 30, bottom: 5, right: 10, left: 10 }
            var width = getDivWidth("#"+scope.id) - margin.left - margin.right
            var height = HEIGHT - margin.top - margin.bottom;

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
                if (scope.showall) {
                    scope.dataset = group.all()
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

            /**
             * update drawing parameters according to new data
             */
            function updateParameters() {
                $log.log("updateParameters");
                
                yScale  = d3.scaleBand()
                    .padding(0.1)
                    .rangeRound([height, margin.top])
                    .domain(scope.dataset.map(function (d) { return yValue(d); }))

                xScale = d3.scaleLinear()
                    .rangeRound([margin.left, width])
                    .domain([0, d3.max(scope.dataset, function (d) { return xValue(d); })])

                xAxis = d3.axisBottom(xScale).ticks(5)
                                
                yAxis = d3.axisLeft(yScale)
                    .tickFormat("")
                                    
                xAxisGen = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(xAxis)
                
                xGridGen = g => g
                    .call(d3.axisTop(xScale).ticks(5).tickSize(-height)
                        .tickFormat(""))     

                yAxisGen = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(yAxis)
                    .call(g => g.select(".domain").remove())


                barsGen = g => {
                    var bar = g.selectAll()
                    .data(scope.dataset)
                    //.enter()
                    .enter().append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .attr("class", "bar")
                    //.attr("transform", function(d, i) { return "translate("+margin.left + ", " + (yScale(i) ) + ")";   })
                    
                    // bar.append("text")
                    // .attr("class", "below")
                    // .attr("x", 12)
                    // .attr("dy", "1.2em")
                    // .attr("text-anchor", "left")
                    // .text(function(d) { return labelFromDomain(d.key); } )
                    // .style("fill", "#000000")
                    //
                    //.attr("transform", `translate(${margin.left},0)`)
                    //.attr("transform", `translate(0,${height - margin.bottom})`)
                    bar.append("rect")
                    .attr("class", function (d) { return Boolean(d.selected) ? "barSelected" : "bar" })
                    //.attr("x", X )
                    .attr("y", Y )
                    .attr("height", yScale.bandwidth())
                    .attr("width", function (d) { return  X(d) - margin.left - margin.right  } )
                    .on("mouseenter", handleMouseEnter)
                    .on("mouseleave", handleMouseLeave)
                    .on("click", handleMouseClick)
                    

                    // bar.append("svg")
                    //     .attr({
                    //         height: barWidth-gap
                    //     })
                    //     .append("text")
                    //     .attr("class", "up")
                    //     .attr("x", 12)
                    //     .attr("dy", "1.2em")
                    //     .attr("text-anchor", "left")
                    //     .text(function(d) { return labelFromDomain(d.key); })
                    //     .style("fill", "#ffffff")

                    bar.exit().remove()
                }
                    
                
            }

            function redrawChart() {
                $log.log("redrawChart");
                updateParameters();
                var t = scope.svg.transition();

                t.select("g.x.axis")
                    .duration(750)
                    .call(xAxisGen);

                t.select("g.y.axis")
                    .duration(500)
                    .call(yAxisGen);

                t.select("g.grid")
                    .duration(500)
                    .call(xGridGen);

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

                scope.svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxisGen);

                // add the Y gridlines
                scope.svg.append("g")
                    .attr("class", "grid")
                    .call(xGridGen)

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

        }
    };
});






