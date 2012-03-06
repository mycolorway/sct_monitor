(function( $ ) {

$(function() {

	init();

});

function init() {
	$.ajax({
        url: "/data/get/wlan/",
        type: "POST",
        dataType: "json",
        success: function( result ) {
            window.Data = result;

			ws.connect();

            initStart();
        }
    });
    
    initTodayOnline();
}

ws.oncontrol = function() {
	initStop();

	var json = {
        'method': 'command',
        'data': {
			'isFun': true,
			'method': "initStop()"
		}
    };

	ws.inst.send( JSON.stringify(json) );

	$( '#today-online li' ).click(function( e ) {
		var city = $( e.currentTarget ).find('span.city').attr('city'),
			json = {
				'method': 'command',
				'data': {
					'isFun': true,
					'method': 'switchCity(' + city + ')'
				}
			};
		
		switchCity(city);
		ws.inst.send( JSON.stringify(json) );
	});
}

ws.oncontroloff = function() {
	initStart();
	$( '#today-online li' ).unbind('click');
}

window.initStart = function() {
    reDrawBar( getTodayOnline() );
    switchCity();

    /*
    barTimer = setInterval( function() {
        reDrawBar( getRandom() );
    }, 30000 );
    */

    cityTimer = setInterval( function() {
        switchCity();   
    }, 5000 );
}

window.initStop = function() {
    //clearInterval( barTimer );
    clearInterval( cityTimer );
}

var $liveCity;
var onlineChart;
var flowChart;
//var barTimer;
var cityTimer;
var cities = [
    "成都市",
    "攀枝花市",
    "德阳市",
    "宜宾市",
    "泸州市",
    "绵阳市",
    "达州市",
    "乐山市",
    "南充市",
    "遂宁市",
    "自贡市",
    "广元市",
    "眉山市",
    "雅安市",
    "凉山州",
    "广安市",
    "阿坝市",
    "甘孜市",
    "内江市",
    "资阳市",
    "巴中市"
];

window.switchCity = function(city) {
    var $next;
    
    if ( city >= 0 ) {
        $next = $( "#today-online li" ).eq( city );
    } else if ( !$liveCity 
        || !$liveCity.next( "li" ).length) {

        $next = $( "#today-online li:first" );
        city = 0;
    } else {
        $next = $liveCity.next( "li" );
        city = $next.find( ".city" ).attr( "city" );
    }

    if ( $liveCity ) $liveCity.removeClass( "live" );
    $next.addClass( "live" );

    $liveCity = $next;

    $( "#city-name" ).text( $liveCity.find( ".city" ).text());



    renderOnline( getOnlineData( city ));   
    renderFlow( getFlowData( city ));
    renderInstrument( getDegree( city ));
}

function getOnlineData( cityIndex ) {
    var cityObj = Data[ cityIndex ],
        data = [];

    data.push( cityObj.values );
    data.push( cityObj.avg1 );

    return data;
}

function getFlowData( cityIndex ) {
    var cityObj = Data[ cityIndex ],
        data = [];

    data.push( cityObj.values2 );
    data.push( cityObj.avg2 );

    return data;
}

function getDegree( cityIndex ) {
    var cityObj = Data[ cityIndex ],
        data = [];

    data.push( cityObj.current_out );
    data.push( cityObj.current_in );

    return data;
}

function getTodayOnline() {
    var data = [];

    $.each( Data, function( i, o ) {
        data.push( o.value );      
    });

    return data;
}

function initTodayOnline() {
    var html = "";

    $.each( cities, function( i, city ) {
        html += '<li>' +
                    '<span class="city" city=' + i + '>' + city + '</span>' + 
                    '<span class="bar"></span>' +
                    '<span class="num"></span>' +
                '</li>';
    });

    $( "#today-online" ).html( html );
}

function renderOnline( data ) {
	var min = minData( data );

    onlineChart = new Highcharts.Chart({
        chart: {
            renderTo: "online-user",
            backgroundColor: "transparent"
        },
        credits: {
            enabled: false 
        },
        title: {
            text: "最近30天趋势",
            style: {
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            }
        },
        subtitle: {
            align: "right",
            floating: true,
            text: "单位：户",
            style: {
                color: "#aaaaaa"
            },
            y: 14 
        },
        legend: {
            verticalAlign: "top",
            borderWidth: 0,
            align: "left",
            floating: true,
            y: -3,
            itemStyle: {
                color: "#aaaaaa",
                fontSize: "14px",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            },
            itemHoverStyle: {
                color: "#ffffff"
            }
        },
        xAxis: {
            type: "datetime",
            dateTimeLabelFormats: {
                week: '%m月%d日'
            },
            tickInterval: 5 * 24 * 3600 * 1000,
            tickWidth: 0,
            gridLineWidth: 1,
            gridLineColor: "#373737",
			showFirstLabel: true,
			showLastLabel: true,
            lineColor: "#373737"
        },
        yAxis: {
            gridLineColor: "#373737",
			min: min,
            title: {
                text: null
            }
        },
        tooltip: {
            crosshairs: [{
                width: 2,
                color: "#9cff7a"
            }],
            shared: true,
            backgroundColor: "#ffffff",
            formatter: function() {
                return Highcharts.dateFormat( "%Y年%m月%d日", this.x ) + ":<br />在线用户 <b>"
                        + this.points[0].y + "</b> 户<br/>省平均 <b>" + this.points[1].y + "</b> 户";
            },
            style: {
                "fontSize": "12px",
                "padding": "5px",
                "lineHeight": "18px"
            }
        },
        plotOptions: {
            column: {
                allowPointSelect: true,
                fillColor: "rgba(20,128,136,0.6)",
                borderWidth: 0,
                lineColor: "#39deeb",
                color: "rgb(20,128,136)",
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 4
                        }
                    }
                }
            },
            spline: {
                allowPointSelect: true,
                lineColor: "#fac763",
                color: "#fac763",
                lineWidth: 3,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            lineWidht: 2,
                            radius: 4
                        }
                    }
                }
            }
        },
        series: [{
            type: "column",
            name: "在线用户数",
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2011, 11, 21 ),
            data: data[0]
        }, {
            type: "spline",
            name: "省平均",
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2011, 11, 21 ),
            data: data[1]
        }]
    });

    //onlineChart.series[0].data[ onlineChart.series[0].data.length - 1 ].select();
    //onlineChart.series[1].data[ onlineChart.series[1].data.length - 1 ].select();
}

function minData( data ) {
	var min = [ 
			Math.min.apply( Math, data[0] ), 
			Math.min.apply( Math, data[1] )
		];

	min = Math.min.apply( Math, min );

	return min;
}

function renderFlow( data ) {
	var min = minData( data );

    flowChart = new Highcharts.Chart({
        chart: {
            renderTo: "flow-rate",
            backgroundColor: "transparent"
        },
        credits: {
            enabled: false 
        },
        title: {
            text: "最近30天趋势",
            style: {
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            }
        },
        subtitle: {
            align: "right",
            floating: true,
            text: "单位：GB",
            style: {
                color: "#aaaaaa"
            },
            y: 14 
        },
        legend: {
            verticalAlign: "top",
            borderWidth: 0,
            align: "left",
            floating: true,
            y: -3,
            itemStyle: {
                color: "#aaaaaa",
                fontSize: "14px",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            },
            itemHoverStyle: {
                color: "#ffffff"
            }
        },
        xAxis: {
            type: "datetime",
            dateTimeLabelFormats: {
                week: '%m月%d日'
            },
            tickInterval: 5 * 24 * 3600 * 1000,
            tickWidth: 0,
            gridLineWidth: 1,
            gridLineColor: "#373737",
			showFirstLabel: true,
			showLastLabel: true,
            lineColor: "#373737"
        },
        yAxis: {
            gridLineColor: "#373737",
            title: {
                text: null
            },
			min: min,
        },
        tooltip: {
            crosshairs: [{
                width: 2,
                color: "#9cff7a"
            }],
            shared: true,
            backgroundColor: "#ffffff",
            formatter: function() {
                return Highcharts.dateFormat( "%Y年%m月%d日", this.x ) + ":<br />发送量 <b>"
                        + this.points[0].y + "</b> GB<br/>省平均 <b>" + this.points[1].y + "</b> GB";
            },
            style: {
                "fontSize": "12px",
                "padding": "5px",
                "lineHeight": "18px"
            }
        },
        plotOptions: {
            area: {
                allowPointSelect: true,
                fillColor: "rgba(20,128,136,0.6)",
                lineColor: "#39deeb",
                color: "rgb(20,128,136)",
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 4
                        }
                    }
                }
            },
            spline: {
                allowPointSelect: true,
                lineColor: "#fac763",
                color: "#fac763",
                lineWidth: 3,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            lineWidht: 2,
                            radius: 4
                        }
                    }
                }
            }
        },
        series: [{
            type: "area",
            name: "发送量",
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2011, 11, 21 ),
            data: data[0]
        }, {
            type: "spline",
            name: "省平均",
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2011, 11, 21 ),
            data: data[1]
        }]
    });
}

function renderInstrument ( data ) {
    var sDegree = data[0] / 1000 * 132 + 24 + "deg",
        rDegree = data[1] / 1000* 132 + 24 + "deg";

    $( "#send-rate h5 em" ).text( data[0] );
    $( "#receive-rate h5 em" ).text( data[1] );

    $( "#send-rate .pointer" )
        .css({
            "-webkit-transform": "rotate(" + sDegree + ")",
            "-moz-transform": "rotate(" + sDegree + ")"
        });

    $( "#receive-rate .pointer" )
        .css({
            "-webkit-transform": "rotate(" + rDegree + ")",
            "-moz-transform": "rotate(" + rDegree + ")"
        });  
}

function reDrawBar( data ) {
    var $cities = $( "#today-online li" ),
        max = Math.max.apply( this, data );

    $cities.each( function( i, city ) {
        $( city ).find( ".num" ).text( data[i] );

        $( city ).find( ".bar" ).css({
            "width": Math.floor( data[i] / max * 240 )
        });
    });
}

})( jQuery );
