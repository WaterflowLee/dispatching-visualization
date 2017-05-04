'use strict'
// 都是函数类模式, 即构造函数返回对象
function scatterChart() {
    var _chart = {};
    var _width, _height,
        _margins = {top:30, left:30, right:30, bottom:30},
        _xScale, _yScale, _outerDivId, _data,
        _colors = d3.scaleOrdinal(d3.schemeCategory20),
        _sizeScale,
        _svg,
        _axesG,
        _bodyG;
    _chart.render = function(){
        if(!_svg){
            _width = $("div#" + _outerDivId).width();
            _height = $("div#" + _outerDivId).height();
            _svg = d3.select("div#" + _outerDivId)
                .append("svg")
                .attr("width", _width)
                .attr("height", _height);
            renderAxes();
            defineMainBodyClip();
        }
        renderMainBody();
    };
    function renderAxes(){
        _axesG = _svg.append("g")
            .attr("class","axes");
        renderXAxis();
        renderYAxis();
    }
    function renderXAxis(){
        _xScale = _xScale.range([0, quadrantWidth()]);
        var xAxisGenerator = d3.axisBottom(_xScale);
        _axesG.append("g")
            .attr("class", "x axis")
            // 是相对本该在的位置的移动！本该在的位置和父元素有关
            .attr("transform", function(){
                return "translate(" + xStart() + "," +
                    yStart() + ")";
            })
            .call(xAxisGenerator);
    }
    function renderYAxis(){
        _yScale = _yScale.range([quadrantHeight(), 0]);
        var yAxisGenerator = d3.axisLeft(_yScale);
        _axesG.append("g")
            .attr("class", "y axis")
            // 是相对本该在的位置的移动！本该在的位置和父元素有关
            .attr("transform", function(){
                return "translate(" + xStart() + "," +
                    yEnd() + ")";
            })
            .call(yAxisGenerator);
    }
    function defineMainBodyClip(){
        var padding = 5;
        _svg.append("defs")
            .append("clipPath")
            .attr("id", "MainBodyClipPath")
            .append("rect")
            .attr("x", 0 - padding)
            .attr("y", 0 - padding)
            .attr("width", quadrantWidth() + 2*padding)
            .attr("height", quadrantHeight() + 2*padding);
    }
    function renderMainBody(){
        if(!_bodyG) {
            _bodyG = _svg.append("g")
                .attr("class", "mainBody")
                .attr("transform", function () {
                    return "translate(" + xStart() + ","
                        + yEnd() + ")";
                })
                .attr("clip-path", "url(#MainBodyClipPath)");
        }
        renderCircles();
    }
    function renderCircles(){
        // selectAll 和 data 分别指定两个集合,
        // 两个集合都指定后才能enter
        // _bodyG.selectAll("circle.node").remove();
        _bodyG.selectAll("circle.node")
            .data(_data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return _xScale(d.x);
            })
            .attr("cy", function (d) {
                return _yScale(d.y);
            })
            .attr("r", function (d) {
                return _sizeScale(d.size);
            })
            .attr("id", function (d) {
                // console.log("New enter!");
                return d.id;
            })
            .attr("class", "node")
            .attr("fill", "#ffffff");
        _bodyG.selectAll("circle.node")
            .data(_data)
            .transition()
            .attr("fill",function(d){
                return _colors(d.color);
            })
            .attr("class", function (d) {
            return d.class?"node " + d.class:"node";
            });
        // _bodyG.selectAll("circle.node")
        //     .data(_data)
        //     .exit()
        //     .remove();
        // 在chrome的debug里面看到的是直接的颜色更改，没有节点的增加或者减少，
        // 即没有新的enter和exit，没有新的enter，可以在enter中验证:
        // 在初始的100个enter之后，改变节点颜色，并没有新的enter发生
    }

    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) { // <-1C
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.xScale = function (x) {
        if (!arguments.length) return _xScale;
        _xScale = x;
        return _chart;
    };

    _chart.yScale = function (y) {
        if (!arguments.length) return _yScale;
        _yScale = y;
        return _chart;
    };

    _chart.data = function (d){
        if(!arguments.length) return _data;
        _data = d;
        return _chart;
    };
    _chart.outerDivId = function (id){
        if(!arguments.length) return _outerDivId;
        _outerDivId = id;
        return _chart;
    };
    _chart.sizeScale = function (scale) {
        if(!arguments.length) return _sizeScale;
        _sizeScale = scale;
        return _chart
    };
    return _chart; // <-1E
}
//
// function randomData() {
//     return Math.random() * 9;
// }
// var numberOfSeries = 35,
//         numberOfDataPoint = 35,
//         data = [];
//
// for (var i = 0; i < numberOfSeries; ++i){
//     for (var j = 0; j < numberOfDataPoint; ++j){
//         data.push([i, j, randomData()]);
//     }
// }
// var chart = heatmapChart()
//         .outerDivId("graphHolder")
//         .xScale(d3.scaleLinear().domain([0, 35]))
//         .yScale(d3.scaleLinear().domain([0, 35]));
//
//
// chart.data(data);
//
// chart.render();