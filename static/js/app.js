'use strict'
var scriptGlobals = {};
scriptGlobals.frames = [];
scriptGlobals.frame_num = null;
scriptGlobals.machine_max_load = null;
scriptGlobals.machine_info = null;
scriptGlobals.scatterChartObj =null;
scriptGlobals.networkChartObj = null;
var eventHandlers = {
    "nodeClick":
        function () {
            var className = $(this).attr("class").replace(" ", ".");
            var ids = [];
            $("."+className).each(function () {
                ids.push($(this).attr("id"));
            });
        },
    "frameNumSliderSlide":
        function (scatterChartObj) {
            return function(event, ui) {
                $("#frameNum").text(ui.value);
                scatterChartObj.data(Object.values(scriptGlobals.frames[ui.value])).render();
            };
        },
    "getJSONSuccess":
        function (echo_data) {
            scriptGlobals.machine_info = get_machine_info(echo_data["init_service_server_in_district"][0]);
            scriptGlobals.frames = generate_frames(echo_data["machine_slave_dispatch_round_2"], scriptGlobals.machine_info);
            scriptGlobals.frame_num = scriptGlobals.frames.length;
            scriptGlobals.machine_max_load = Object.values(scriptGlobals.machine_info).reduce(function (n1, n2) {
                return n1.access_num > n2.access_num ? n1 :n2;
            }).access_num;
            scriptGlobals.scatterChartObj = scatterChartWrapper();
            scriptGlobals.networkChartObj = paperNet().outerDivId("graphHolderLeft");
            
            $("#frameNumSlider").slider({
                range: false,
                min: 0,
                max: scriptGlobals.frame_num - 1,
                value:0,
                slide:eventHandlers.frameNumSliderSlide(scriptGlobals.scatterChartObj)
            });
            scriptGlobals.scatterChartObj.data(scriptGlobals.frames[0]).render();
            $("circle.node").click(eventHandlers.nodeClick);
        }
};

$(function () {
    var graphHolder = $("#graphHolder");
    graphHolder.css("height", graphHolder.css("width"));
    var graphHolderLeft = $("#graphHolderLeft");
    graphHolderLeft.css("height", graphHolderLeft.css("width"));

    $.getJSON("/dispatching-visualization/data/2017-05-03 21-22-48.json",
        eventHandlers.getJSONSuccess
    );
});

var get_machine_info = function (data) {
    var machine_info = {};
    var cal_access_num = function (service_access_log) {
        var access_num_list = Object.values(service_access_log);
        // 这个地方就很奇怪了
        // var access_num_list_int = $.map(access_num_list, parseInt);
        var access_num_list_int = $.map(access_num_list, function(x){return parseInt(x);});
        var access_num = access_num_list_int.reduce(function (n1, n2) {
                                                        return n1 + n2;
        });
        return access_num;
    };
    data.forEach(function (d) {
        machine_info[d.unique_id] = {
            "unique_id":d.unique_id,
            "position":d.position,
            "access_num":cal_access_num(d.service_access_log)
        };
    });
    return machine_info;
};

var generate_frames = function (district_sequence, machine_info) {
    var frames = [];
    var init_frame_state = {};
    for (var k in machine_info){
        if (machine_info.hasOwnProperty(k)){
            var m = machine_info[k];
            init_frame_state[k] = {"x":m.position[0],
                                    "y":m.position[1],
                                    "size":m.access_num,
                                    "color":undefined,
                                    "id":k,
                                    "class":undefined
            };
        }
    }
    var cur_frame_state = $.extend(false, {}, init_frame_state);

    for (var i=0;i<district_sequence.length;i++){
        var master = district_sequence[i]["master"];
        var slaves = district_sequence[i]["slaves"];
        // var cur_frame_state = $.extend(true, {}, init_frame_state);
        cur_frame_state[master.unique_id].color = master.unique_id;
        cur_frame_state[master.unique_id].class = master.unique_id;
        for (var j=0;j<slaves.length;j++){
            var slave = slaves[j];
            cur_frame_state[slave.unique_id].color = master.unique_id;
            cur_frame_state[slave.unique_id].class = master.unique_id;
        }
        // 这个地方就很奇怪了
        // frames.push(Object.values(cur_frame_state));
        frames.push(Object.values($.extend(true, {}, cur_frame_state)));
    }
    return frames;
};
function scatterChartWrapper() {
    return scatterChart().outerDivId("graphHolder")
        .margins({top:30, left:50, right:30, bottom:30})
        .xScale(d3.scaleLinear().domain([0, 1000]))
        .yScale(d3.scaleLinear().domain([0, 1000]))
        .sizeScale(d3.scaleLinear().domain([0,scriptGlobals.machine_max_load]).range([5, 20]));
}

function () {
    
}
