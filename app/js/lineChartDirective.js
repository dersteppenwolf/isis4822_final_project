dataViz.directive('lineChart', function ($parse, $log) {
    return {
        restrict: 'EA',
        template: "<svg></svg>",
        // https://stackoverflow.com/questions/20018507/angular-js-what-is-the-need-of-the-directive-s-link-function-when-we-already-ha
        link: function (scope, elem, attrs) {

            var exp = $parse(attrs.chartData);

            scope.dataset = exp(scope);
            var xScale, yScale, rScale, xAxisGen, yAxisGen, line;

            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0]);

            var margin = { top: 20, right: 40, bottom: 10, left: 20 }
            var width = window.innerWidth - margin.left - margin.right
            //var height = window.innerHeight - margin.top - margin.bottom; 
            // var width = 1024 - margin.left - margin.right
            var height = 300 - margin.top - margin.bottom;
            var radius = 3;


            // on window resize, re-render d3 canvas
            window.onresize = function () {
                $log.log("onresize");
                width = window.innerWidth - margin.left - margin.right;
                $log.log(width);
                redrawLineChart(scope.dataset);
                return scope.$apply();
            };


            ////////////////
            scope.$watch(exp, function (newVal, oldVal) {
                $log.log("watch");
                try {
                    $log.log("to resolve");
                    if (!scope.initialized) {
                        newVal.then(render);
                    } else {
                        newVal.then(redrawLineChart);
                    }

                }
                catch (err) {
                    //already resolved
                    $log.log("already resolved");

                    if (!scope.initialized) {
                        render(newVal);
                    } else {
                        redrawLineChart(newVal);
                    }
                }
            });




            ////////////////

            function handleMouseOver(d, i) {

                d3.select(this)
                    .attr("r", function (d) { return rScale(d.radius) * 2 })
                    .attr("class", "dotPopups");

                svg.append("text")
                    .attr("id", "t" + d.x + "-" + d.y + "-" + i)
                    .attr("x", function () { return xScale(d.date) - 50; })
                    .attr("y", function () { return yScale(d.count) - 17; })
                    .attr("class", "dotPopupsText")
                    .text(function () {
                        return [d.label + "  Deaths : " + d.radius + " ,  Events : " + d.count ];
                    })
            }

            function handleMouseOut(d, i) {
                d3.select(this)
                    .attr("r", function (d) { return rScale(d.radius) })
                    .attr("class", "dot");

                d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
            }

            function updateParameters() {
                xScale = d3.scaleTime()
                    .domain(d3.extent(scope.dataset, d => d["date"]))
                    .range([margin.left, width - margin.right])

                var maxYScale = d3.max(scope.dataset, d => d["count"]);
                var maxRscale = d3.max(scope.dataset, d => d["radius"]);

                rScale = d3.scaleLinear()
                    .domain([0, maxRscale]).nice()
                    .range([2, 10])

                yScale = d3.scaleLinear()
                    .domain([0, maxYScale]).nice()
                    .range([height - margin.bottom, margin.top])

                line = d3.line()
                    .x(function (d) { return xScale(d.date); }) // set the x values for the line generator
                    .y(function (d) { return yScale(d.count); }) // set the y values for the line generator 
                    .curve(d3.curveMonotoneX)

                xAxisGen = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeMonth.every(1))
                        .tickSizeOuter(0))

                yAxisGen = g => g
                    .attr("transform", `translate(${margin.left - 20},0)`)
                    .call(d3.axisLeft(yScale))
                    .call(g => g.select(".domain").remove())
                    .call(g => g.select(".tick:last-of-type text")
                        .attr("x", 3)
                        .attr("text-anchor", "start")
                        .attr("font-weight", "bold")
                        .text(scope.dataset.count))
            }

            function redrawLineChart(data) {
                $log.log("redrawLineChart");

                scope.dataset = data;

                updateParameters();

                // Select the section we want to apply our changes to
                var t = svg.transition();

                t.select("g.x.axis")
                    .duration(750)
                    .call(xAxisGen);

                t.select("g.y.axis")
                    .duration(750)
                    .call(yAxisGen);

                // Make the changes
                t.select(".lineSeries")
                    .duration(750)
                    .attr("d", line(scope.dataset));



                svg.selectAll(".dot")
                    .remove()

                var circle = svg.selectAll(".dot")
                    .data(scope.dataset)
                    .enter().append("circle")
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function (d) { return xScale(d.date) })
                    .attr("cy", 0)
                    .attr("r", 0)
                    .style("opacity", 0)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)


                circle.transition()
                    .duration(750 * 3)
                    .attr("cy", function (d) { return yScale(d.count) })
                    .attr("r", function (d) { return rScale(d.radius) })
                    .style("opacity", 0.7)



            }



            function render(data) {

                $log.log("render");

                scope.dataset = data;

                $log.log(width);

                updateParameters()

                svg = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("g")
                    .attr("class", "x axis")
                    .call(xAxisGen);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxisGen);

                // gridlines in x axis function
                function make_x_gridlines() {
                    return d3.axisBottom(xScale)
                        .ticks(13)
                }

                // gridlines in y axis function
                function make_y_gridlines() {
                    return d3.axisLeft(yScale)
                        .ticks(10)
                }

                // add the X gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + height + ")")
                    .call(make_x_gridlines()
                        .tickSize(-height)
                        .tickFormat("")
                    )

                // add the Y gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .call(make_y_gridlines()
                        .tickSize(-width)
                        .tickFormat("")
                    )

                svg.append("path")
                    .attr("class", "lineSeries")
                    .attr("d", line(scope.dataset));



                // 12. Appends a circle for each datapoint 
                svg.selectAll(".dot")
                    .data(scope.dataset)
                    .enter()
                    .append("circle")
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function (d) { return xScale(d.date) })
                    .attr("cy", function (d) { return yScale(d.count) })
                    .attr("r", function (d) { return rScale(d.radius) })
                    .style("opacity", 0.7)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut);


                scope.initialized = true;

            }


        }
    };
});






