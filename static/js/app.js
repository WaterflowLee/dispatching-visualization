'use strict'
var data = {};
var frames = [];
var frame_num = null;
var machine_max_load = null;

$(function () {
    // 异步的, 因此将第二/第三代码段放到回调函数之外就会出现问题, 比如frames frame_num machine_max_load 分别未被重新赋予有意义的值
    $.getJSON("/dispatching-visualization/data/round_1.json", function (echo_data) {
        var LOGS = echo_data["LOGS"];
        var INFOS = echo_data["INFOS"];
        frame_num = LOGS.length;
        machine_max_load = _.max(Object.values(INFOS["load"]));
        _.map(Object.keys(INFOS["load"]), function (key) {
            var pos = INFOS["position"][key];
            data[key] = [pos[0], pos[1], INFOS["load"][key]];
        });
        for (var i in LOGS){
            if (LOGS.hasOwnProperty(i)){
                var frameData = $.extend(true, {}, data);
                var ret = LOGS[i]["machine_district_dispatch_result"];
                _.map(Object.keys(ret), function (k) {
                    frameData[k].push(parseInt(k));
                    _.map(ret[k], function (j) {
                        frameData[j].push(parseInt(k));
                    });
                });
                frames.push(frameData);
            }
        }

        // 第二代码段
        var chart = scatterChart().outerDivId("graphHolder")
            .xScale(d3.scaleLinear().domain([0, 1000]))
            .yScale(d3.scaleLinear().domain([0, 1000]))
            .sizeScale(d3.scaleLinear().domain([0,machine_max_load]).range([5, 20]));

        // 第三代码段
        $("#frame_num_slider").slider({
            range: false,
            min: 0,
            max: frame_num - 1,
            value:0,
            slide: function(event, ui) {
                $("#frame_num span").text(ui.value);
                chart.data(Object.values(frames[ui.value])).render();
            }
        });
        chart.data(Object.values(frames[0])).render();
    });
});
