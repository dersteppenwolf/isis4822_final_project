dataViz.directive('barChart', function ($parse, $log) {
    return {
        restrict: 'EA',
        template: "<svg></svg>",
        // https://stackoverflow.com/questions/20018507/angular-js-what-is-the-need-of-the-directive-s-link-function-when-we-already-ha
        link: function (scope, elem, attrs) {

            var crossfilter = $parse(attrs.crossfilter);
            var group = $parse(attrs.group);

            scope.dataset = []
            var xScale, yScale, rScale, xAxisGen, yAxisGen, line;

            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0]);
            svg.attr("preserveAspectRatio", "xMinYMin meet").classed("svg-content", true)

            var margin = { top: 20, right: 40, bottom: 10, left: 40 }
            var width = getDivWidth('.chart-container') - margin.left - margin.right

            //var height = getDivHeight('.chart-container') - margin.top - margin.bottom;
            var height = 300- margin.top - margin.bottom;
        
            window.onresize = function () {
                $log.log("onresize");
                width = getDivWidth('.chart-container') - margin.left - margin.right;
                $log.log(width);
                //height = getDivHeight('.chart-container') - margin.top - margin.bottom;
                //$log.log(height);
                redrawChart();
               // return scope.$apply();
            };


            ////////////////
            scope.$watch(crossfilter, function (newVal, oldVal) {
                $log.log("watch crossfilter");
                if(newVal.onChange){
                    crossfilter = newVal
                    crossfilter.onChange(onCrossfilterChange);
                }
            });

            scope.$watch(group, function (newVal, oldVal) {
                $log.log("watch group");
                if(newVal.all){
                    group = newVal
                    onCrossfilterChange("load")
                }
            });

            function onCrossfilterChange  (eventType) {
                $log.log("barChartDirective - onCrossfilterChange")
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
            function xValue (d) { 
                return d.key; 
            }

            function yValue (d) { 
                return d.value.costPerson 
            }

            // The x-accessor for the path generator; xScale o xValue.
            function X(d) {
                return xScale(xValue(d));
            }

            // The y-accessor for the path generator; yScale o yValue.
            function Y(d) {
                return yScale(yValue(d));
            }

            // gridlines in y axis function
            function make_y_gridlines() {
                return d3.axisLeft(yScale).ticks(5)
            }

            function getDivWidth (div) {
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
                xScale = d3.scaleBand().padding(0.1)
                yScale = d3.scaleLinear()

                xScale.rangeRound([margin.left, width])
                    .domain(scope.dataset.map(function (d) { return xValue(d); }))

                yScale.rangeRound([height - margin.bottom, margin.top])
                    .domain([0, d3.max(scope.dataset, function (d) { return yValue(d); })])


                /*
                xScale = d3.scaleTime()
                    .domain(d3.extent(scope.dataset, d => d["date"]))
                    .range([margin.left, width - margin.right])

                yScale = d3.scaleLinear()
                    .domain([0, maxYScale]).nice()
                    .range([height - margin.bottom, margin.top])

                line = d3.line()
                    .x(function (d) { return xScale(d.date); }) // set the x values for the line generator
                    .y(function (d) { return yScale(d.count); }) // set the y values for the line generator 
                    .curve(d3.curveMonotoneX)
                */

                

                xAxisGen = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale))

                yAxisGen = g => g
                    .attr("transform", `translate(${margin.left - 20},0)`)
                    .call(d3.axisLeft(yScale).ticks(5))
                    .call(g => g.select(".domain").remove())
                    .call(g => g.select(".tick:last-of-type text")
                        .attr("text-anchor", "start")
                        .attr("font-weight", "bold")
                        .text(scope.dataset.count))
            }




            function redrawChart() {
                $log.log("redrawChart");
                updateParameters();

                // Select the section we want to apply our changes to
                var t = svg.transition();

                t.select("g.x.axis")
                    .duration(750)
                    .call(xAxisGen);

                t.select("g.y.axis")
                    .duration(750)
                    .call(yAxisGen);

                /*
                // Make the changes
                t.select(".lineSeries")
                    .duration(750)
                    .attr("d", line(scope.dataset));
                    */

            }



            function render() {
                $log.log("render");
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

                // add the Y gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .call(make_y_gridlines()
                        .tickSize(-width)
                        .tickFormat("")
                    )

                $log.log(scope.dataset)
                
                    //.attr("class", ".bar")
                    //.data(scope.dataset)
                
                //var bars = svg.append("g")
                //    .attr("class", ".bar")

                var bars =     svg.selectAll()
                    .data(scope.dataset)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    //.merge(bars)
                    .attr("x", X)
                    .attr("y", Y )
                    .attr("width", xScale.bandwidth())
                    .attr("height",  function (d) { 
                        return height - Y(d)    
                    } )
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .on("click", handleMouseClick);
    
                bars.exit().remove();

                


                /*
                svg.append("path")
                    .attr("class", "lineSeries")
                    .attr("d", line(scope.dataset));
                */


                scope.initialized = true;

            }

            function handleMouseOver(d, i) {
                /** 
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
                 */
            }

            function handleMouseOut(d, i) {
                /* d3.select(this)
                    .attr("r", function (d) { return rScale(d.radius) })
                    .attr("class", "dot");

                d3.select("#t" + d.x + "-" + d.y + "-" + i).remove(); */
                
            }

            function handleMouseClick(d, i){
                $log.log("handleMouseClick");

            }


        }
    };
});






