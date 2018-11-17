

function barChart(selection) {
    var
        margin = { top: 20, right: 20, bottom: 30, left: 60 },
        width = 400,
        height = 400,
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom,
        xValue = function (d) { return d[0]; },
        yValue = function (d) { return d[1]; },
        xScale = d3.scaleBand().padding(0.1),
        yScale = d3.scaleLinear(),
        onMouseOver = function () { },
        onMouseOut = function () { },
        onMouseClick = function () { };

    const axisBottom = d3.axisBottom();
    let data;

    function chart(selection) {
        selection.each(function (data) {
            // console.log("data barChartModule", data);
            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var svgEnter = svg.enter().append("svg")
                .attr("class", "barchart");

            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");

            // Update the outer dimensions.
            svg.merge(svgEnter)
                .attr("width", width)
                .attr("height", height);

            // Update the inner dimensions.
            var g = svg.merge(svgEnter).select("g")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            xScale.rangeRound([0, innerWidth])
                .domain(data.map(function (d) { return xValue(d); }));
            yScale.rangeRound([innerHeight, 0])
                .domain([0, d3.max(data, function (d) { return yValue(d); })]);

            g.select(".x.axis")
                .attr("transform", "translate(0," + innerHeight + ")")
                .call(axisBottom);

            g.select(".y.axis")
                .call(d3.axisLeft(yScale).ticks(5))
            
                .append("text")
                .attr("text-anchor", "start")
                .attr("x", 4)//padding of 4px
                .attr("y", 14)
              //  .attr("transform", "translate(-50,20) rotate(-90)")
              //  .style("font-size", "15px")
              //  .style("fill", "black")
               // .attr("dx", "-350px")
            //    .attr("dy", "0.71em")
            //    .attr("text-anchor", "end")
               // 
               // 
               // .text("Cantidad de eventos reportados");

            var bars = g.selectAll(".bar")
                .data(function (d) { return d; });

            bars.enter().append("rect")
                .attr("class", "bar")
                .merge(bars)
                .attr("x", X)
                .attr("y", Y)
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return innerHeight - Y(d); })
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)
                .on("click", onMouseClick);

            bars.exit().remove();
        });

    }

    // The x-accessor for the path generator; xScale o xValue.
    function X(d) {
        return xScale(xValue(d));
    }

    // The y-accessor for the path generator; yScale o yValue.
    function Y(d) {
        return yScale(yValue(d));
    }

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        innerWidth = width - margin.left - margin.right;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        innerHeight = height - margin.top - margin.bottom;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.xScale = function (_) {
        if (!arguments.length) return xScale;
        xScale = _;
        axisBottom.scale(xScale);
        return chart;
    };

    chart.xTicks = function (_) {
        if (!arguments.length) return xTicks;
        xTicks = _;
        axisBottom.ticks(xTicks);
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.yAttrib = function (_) {
        if (!arguments.length) return yAttrib;
        yAttrib = _;
        return chart;
    };

    chart.dimension = function (_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.group = function (_) {
        if (!arguments.length) return group;
        group = _;
        console.log("abc")
        console.log(group.all())
        data = group.all()
        return chart;
    };

    chart.round = function (_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };


    chart.renderAll = function (_) {
        if (!arguments.length) return renderAll;
        renderAll = _;
        return chart;
    };

    chart.onMouseOver = function (_) {
        if (!arguments.length) return onMouseOver;
        onMouseOver = _;
        return chart;
    };

    chart.onMouseOut = function (_) {
        if (!arguments.length) return onMouseOut;
        onMouseOut = _;
        return chart;
    };

    chart.onMouseClick = function (_) {
        if (!arguments.length) return onMouseClick;
        onMouseClick = _;
        return chart;
    };

    return chart;
}