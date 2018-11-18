dataViz.directive('barChart', function ($parse, $log, $filter) {
    return {
        restrict: 'EA',
        scope: true,
        template: '',
        // https://stackoverflow.com/questions/20018507/angular-js-what-is-the-need-of-the-directive-s-link-function-when-we-already-ha
        link: function (scope, elem, attrs) {

            scope.crossfilter = $parse(attrs.crossfilter);
            var group = $parse(attrs.group);

            scope.id = attrs.id
            scope.title = attrs.title
            scope.dataset = []

            var xScale, yScale, yGridGen, xAxisGen, yAxisGen, barsGen;

            scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

            scope.svg = d3.select("#" + scope.id)
                .append("svg")
                .attr("id", scope.id + "-svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .classed("svg-content", true)

            var margin = { top: 30, bottom: 10, right: 10, left: 40 }
            var width = getDivWidth('.chart-container') - margin.left - margin.right

            //var height = getDivHeight('.chart-container') - margin.top - margin.bottom;
            var height = 300 - margin.top - margin.bottom;

            window.onresize = function () {
                $log.log("onresize");
                width = getDivWidth('.chart-container') - margin.left - margin.right;
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

            scope.$watch(group, function (newVal, oldVal) {
                $log.log("watch group " + scope.id);
                if (newVal.all) {
                    group = newVal
                    scope.onCrossfilterChange("load")
                }
            });

            scope.onCrossfilterChange = function (eventType) {
                $log.log("barChartDirective - onCrossfilterChange " + scope.id)
                $log.log(eventType)
                scope.dataset = group.all()

                // natural order
                group.all().forEach(function (p, i) {
                    //$log.log(p.key + ": " + p.value);
                    $log.log(p);
                });

                if (!scope.initialized) {
                    render();
                } else {
                    redrawChart();
                }
                try {
                    //  scope.$apply();
                } catch (error) {
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
                return "<b>" + (d.key) +
                    "</b>:<br>Cost/Person: " + $filter('megaNumber')(d.value.costPerson) +
                    ",  Costs: " + $filter('megaNumber')(d.value.costs) +
                    ",   People Served: " + $filter('megaNumber')(d.value.people)
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


            /**
             * update drawing parameters according to new data
             */
            function updateParameters() {
                xScale = d3.scaleBand()
                    .padding(0.1)
                    .rangeRound([margin.left, width])
                    .domain(scope.dataset.map(function (d) { return xValue(d); }))

                yScale = d3.scaleLinear()
                    .rangeRound([height - margin.bottom, margin.top])
                    .domain([0, d3.max(scope.dataset, function (d) { return yValue(d); })])

                xAxisGen = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale))

                yAxisGen = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(yScale).ticks(5))
                    .call(g => g.select(".domain").remove())

                yGridGen = g => g
                    .call(d3.axisLeft(yScale).ticks(5).tickSize(-width)
                        .tickFormat(""))

                barsGen = g => g
                    .selectAll()
                    .data(scope.dataset)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", X)
                    .attr("y", Y)
                    .attr("width", xScale.bandwidth())
                    .attr("height", function (d) { return height - Y(d) - margin.bottom })
                    .on("mouseenter", handleMouseEnter)
                    .on("mouseleave", handleMouseLeave)
                    .on("mousemove", handleMouseMove)
                    .on("click", handleMouseClick)
                    .exit().remove();
            }




            function redrawChart() {
                $log.log("redrawChart");
                updateParameters();

                // Select the section we want to apply our changes to
                var t = scope.svg.transition();

                t.select("g.x.axis")
                    .duration(750)
                    .call(xAxisGen);

                t.select("g.y.axis")
                    .duration(500)
                    .call(yAxisGen);

                t.select("g.grid")
                    .duration(500)
                    .call(yGridGen);

                scope.svg.selectAll(".bar").remove()

                scope.svg.selectAll(".bars")
                    .call(barsGen)
            }



            function render() {
                $log.log("render");
                updateParameters()

                scope.svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

                scope.svg.append("text")
                    .attr("class", "chartTitle")
                    .attr("x", (width / 2))
                    .attr("y", 0 + (margin.top / 2))
                    .attr("text-anchor", "middle")
                    .text(scope.title);

                scope.initialized = true;
            }

            function handleMouseEnter(d, i) {
                $log.log("handleMouseEnter");

                scope.tooltip.style("left", d3.event.pageX - 80 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html(tooltipValue(d));

            }

            function handleMouseLeave(d, i) {
                //$log.log("handleMouseLeave");
                scope.tooltip.style("display", "none");
            }

            function handleMouseMove(d, i) {
                //$log.log("handleMouseMove");
            }


            function handleMouseOut(d, i) {
                //$log.log("handleMouseOut");
            }

            function handleMouseClick(d, i) {
                $log.log("handleMouseClick");

            }


        }
    };
});






