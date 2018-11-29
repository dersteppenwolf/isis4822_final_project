dataViz.directive('colombiaMap', function ($parse, $log, $filter) {
    return {
        restrict: 'EA',
        scope: true,
        template: '',
        link: function (scope, elem, attrs) {

            var url = "data/colombia_index.geojson";
            //$log.log(url);

            scope.crossfilter = $parse(attrs.crossfilter);
            var dimension = $parse(attrs.dimension);
            var group = $parse(attrs.group);
            var domain = $parse(attrs.domain);

            scope.id = attrs.id
            scope.charttitle = attrs.charttitle

            scope.dataset = []

            var mapLayer, centered;

            scope.tooltip = d3.select("body").append("div").attr("class", "toolTip");

            scope.svg = d3.select("#" + scope.id)
                .append("svg")
                .attr("id", scope.id + "-svg")

            var margin = { top: 0, bottom: 0, right: 0, left: 0 }
            var width = getDivWidth("#" + scope.id) - margin.left - margin.right

            var divH = getDivHeight("#" + scope.id)
            var height = divH //- margin.top - margin.bottom;

            var projection = d3.geoMercator() //d3.geoCylindricalStereographic() // 
                //.scale(width)
                .scale(540)
                .center([-74, 4.5])
                .translate([width / 4, (height) / 2])
                //.angle(45)

            var path = d3.geoPath()
                .projection(projection);



            window.onresize = function () {
                $log.log("onresize");
                //width = getDivWidth('.chart-container') - margin.left - margin.right;
                width = getDivWidth("#" + scope.id) - margin.left - margin.right;
                //$log.log(width);
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


            scope.$on('clearFilter', function (event, data) {
                if (dimension.hasCurrentFilter()) {
                    $log.log("on clearFilter " + scope.id);
                    scope.dataset.forEach(function (d) {
                        d.selected = false
                    })
                    mapLayer.selectAll('path').style('fill',  "rgba(60, 76, 149, 0.9)");
                    dimension.filterAll();
                }
            })



            scope.onCrossfilterChange = function (eventType) {
                $log.log("horizontalBarChartDirective - onCrossfilterChange " + scope.id)
                //$log.log(eventType)
                if (!scope.initialized) {
                    render();
                } 
            }

            ////////////////
            

            function render() {
                $log.log("render " + scope.id);

                scope.svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    

               // mapLayer = scope.svg.append('g')   .classed('map-layer', true);
                mapLayer = scope.svg

                // scope.svg.append("text")
                //     .attr("class", "chartTitle")
                //     .attr("x", (width / 2))
                //     .attr("y", 0 + (margin.top / 2))
                //     .attr("text-anchor", "middle")
                //     .text(scope.charttitle)

                d3.json(url)
                    .then(function (geojson) {
                        //$log.log(geojson.features);
                        geojson.features.forEach(function (v) {
                            v.code = +v.properties.code
                            v.selected = false
                            const items = domain.filter(word => word.code == v.code);
                            if (items.length > 0) {
                                //$log.log(items[0])
                                v.data = items[0]
                            }
                        });

                        mapLayer.selectAll('path')
                            .data(geojson.features)
                            .enter()
                            .append("path")
                            .attr('d', path)
                            .attr('vector-effect', 'non-scaling-stroke')
                            .style("fill", "rgba(60, 76, 149, 0.9)")
                            .style("stroke", "#000")
                            .style("stroke-width", "0.5px")
                            .on('mouseover', mouseover)
                            .on('mouseout', mouseout)
                            .on('click', clicked);
                    });
                scope.initialized = true;
            }

            function clicked(d) {
                $log.log("clicked " + scope.id);
                $log.log(d);
                var x, y, k;

                // Compute centroid of the selected path
                if (d && centered !== d) {
                    var centroid = path.centroid(d);
                    x = centroid[0];
                    y = centroid[1];
                    k = 4;
                    centered = d;
                } else {
                    x = width / 2;
                    y = height / 2;
                    k = 1;
                    centered = null;
                }

                if (!d.selected) {
                    d.selected = true
                    d3.select(this).style('fill', 'rgba(218, 146, 70 ,1)');
                    dimension.filterExact(d.code)
                } else {
                    d.selected = false
                    d3.select(this).style('fill', 'rgba(60, 76, 149, 0.9)');
                    dimension.filterAll();
                }
            }

            function mouseover(d) {
                //$log.log("mouseover "+ scope.id);
                //$log.log(d);
                d3.select(this).style('fill', 'white');
                scope.tooltip.style("left", d3.event.pageX + 20 + "px")
                    .style("top",(d3.event.pageY < 120)? d3.event.pageY + 70 :  d3.event.pageY - 60 + "px")
                    .style("display", "inline-block")
                    .html(tooltipValue(d));
            }

            function mouseout(d) {
                scope.tooltip.style("display", "none");
                mapLayer.selectAll('path')
                    .style('fill', function (d) { return centered && d === centered ? 'rgba(218, 146, 70 ,1)' : "rgba(60, 76, 149, 0.9)"; });
            }

            function tooltipValue(d) {
                return "<b>" + (d.data.label) +
                    " (" + d.data.code + ") </b>:<br>C/P: $" + $filter('megaNumber')(d.data.costo_proc_usuario) +
                    ",   People: " + $filter('megaNumber')(d.data.numero_personas_atendidas) +
                    ",  Costs: $" + $filter('megaNumber')(d.data.costo_procedimiento)
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

        }
    };
});






