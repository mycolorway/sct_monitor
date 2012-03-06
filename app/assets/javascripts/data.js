var jQT;
var chart;
var boardTimer;
var underControl = false;
var bindClick;

$( function() {
    bindClick = isIpad? "tap" : "click";

    $.ajax({
        url: "/data/get/kpi/",
        type: "POST",
        dataType: "json",
        success: function( result ) {
            window.Data = result;

            initDom();
            
            initjQT();

            initBoard();

            ws.connect();

            initStart();
        }
    });
});

ws.oncontrol = function() {
	initStop();
}

ws.oncontroloff = function() {
	initStart();
}

function initBoard() {
    $( ".board" ).bind( bindClick, function( e ) {
        var target = $( e.currentTarget ),
            option = {
                width: 482,
                height: 619
            },
            index = target.parent().children( ".board" ).index( target ),
            position = target.position(),
            top = position.top,
            left = position.left,
            $copy = target.clone( false );

        if ( index == 3 ) {
            option.left = left - 250;
        } else if ( index > 3 ) {
            option.top = top - 320;

            if ( index == 7 ) {
                option.left = left - 250;
            }
        }

        //remove current copy elem
        var $old = target.siblings( ".board-copy" );
        
        if ( $old.length ) {
            minBoard( $old );
        }

        $copy.attr( "index", index )
            .addClass( "board-copy" )
            .removeClass( "board" )
            .css({
                "position": "absolute",
                "top": top,
                "left": left
            }).appendTo( target.parent());

        $copy.animate( option, 500, "easeInOutCubic", function() {
            var $delta = $( ".delta", $copy ),
                $chart;

            $( '<div class="board-min"></div>' ).insertAfter( $delta )
                .bind( bindClick, function( e ) {
                    minBoard( $( e.target ).parents( ".board-copy" ));
                });

            $chart = $( '<div class="data-chart"></div>' ).insertAfter( $delta );
            createChart( $chart );
        });
    });
}


function minBoard( $el ) {
    if ( !$el ) {
        $el = $( ".board-copy:visible" );
    }

    var index = $el.attr( "index" ) * 1,
        oldPos = $el.position(),
        option = {
            width: 230,
            height: 298
        };

    if ( index == 3 ) {
        option.left = oldPos.left + 247;
    } else if ( index > 3 ) {
        option.top = oldPos.top + 320;

        if ( index == 7 ) {
            option.left = oldPos.left + 247;
        }
    }

    $el.animate( option, 500, "easeInOutCubic", function() {
        $el.remove();
    });
}

function getRandomOnline() {
    var data = [],
        value;

    for ( var i = 0; i < 30; i++ ) {
        value = Math.random() * 2000;
        data.push( Math.floor( value ));
    }

    return data;
}

function createChart( $el ) {
    var data = getRandomOnline();

    chart = new Highcharts.Chart({
        chart: {
            renderTo: $el[0],
            backgroundColor: "transparent",
            marginTop: 60,
            marginRight: 20,
            marginLeft: 40
        },
        colors: [
            "#fac763"
        ],
        credits: {
            enabled: false 
        },
        title: {
            text: "最近30天趋势",
            align: "left",
            x: 20,
            style: {
                color: "#b6b6b6",
                fontSize: "24px",
                fontWeight: "bold",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            }
        },
        /*
        subtitle: {
            align: "right",
            floating: true,
            text: "单位：GB",
            style: {
                color: "#aaaaaa"
            },
            y: 14 
        },
        */
        legend: {
            enabled: false
        },
        xAxis: {
            type: "datetime",
            dateTimeLabelFormats: {
                week: "%m月%d日"
            },
            tickInterval: 5 * 24 * 3600 * 1000,
            tickWidth: 0,
            gridLineWidth: 1,
            gridLineColor: "#373737",
            //startOnTick: true,
            lineColor: "#373737"
        },
        yAxis: {
            gridLineColor: "#373737",
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
                return Highcharts.dateFormat( "%Y年%m月%d日", this.x ) + ":<br /> <b>"
                        + this.points[0].y + "</b>";
            },
            style: {
                "fontSize": "12px",
                "padding": "5px",
                "lineHeight": "18px"
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 4
                        }
                    }
                }
            }
        },
        series: [{
            type: "spline",
            name: "数据",
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2011, 11, 21),
            data: data
        }]
    });
}

function initDom() {
    var html = "";

    $.each( Data, function( i, o ) {

        if ( i % 8 == 0 ) {
            html += '<div id="screen-' + Math.floor( i/8 ) + '" class="screen clearfix">';
        }

        var delta = "",
            ratioArray = o.ratio.toString().split( "." );

        if ( ratioArray[1].length == 1 ) {
            ratioArray[1] += "0";
        }

        if ( o.ratio > 0 ) {
            delta = '<div class="delta up">&#x25b2;';
        } else {
            delta = '<div class="delta down">&#x25bc;';        
        }

        delta += '<em>' + ratioArray[0] + '<sup>.' + ratioArray[1] + '%</sup></em></div>';


        html += '<div id="board-' + o.id + '" class="board"><h5 class="title">' + 
                    o.title + '</h5><div class="main">';

        if ( o.widget == "number" ) {

            html += '<span class="value">' + formatNumber( o.current ) + '</span>';

        } else if ( o.widget == "gauge" ) {

                        
            html += '<div class="instrument"><h5><em>' + o.current + o.unit + '</em></h5><div class="face"> <div class="pointer"></div> </div> <div class="min"> <span>Min</span> <span class="min-value">' + o.min + o.unit + '</span> </div> <div class="max"> <span>Max</span> <span class="max-value">' + o.max + o.unit + '</span> </div> </div>';

        }

        html += '</div>' + delta + '<div class="unit">单位: ' + o.unit + '</div></div>';

        if ( i % 8 == 7 ) {
            html += "</div>";
        }

    });

    $( "#jqt" ).html( html );

    $.each( Data, function( i, o ) {
        if ( o.widget == "gauge" ) {
            var $instru = $( "#board-" + o.id ).find( ".instrument" );

            renderInstrument( $instru, o.current, o.min, o.max );
        }
    });

    initIndicator();
}

function initjQT() {
    jQT = new $.jQTouch({
        icon: "jqtouch.png",
        statusBar: "black-translucent",
        fullScreen: false,
        useFastTouch: true, 
        preloadImages: [
            "/assets/images/loading.gif"
        ]
    });

    $( "#screen-indicator" ).find( "span" )
        .bind( "click", function( e ) {
            jQT.goTo( $( e.target ).attr( "screen" ), "slideleft" );
        });

    $( "#jqt .screen"  )
        .bind( "pageAnimationEnd", function( e, info ) {

            if ( info.direction == "in" ) {
                var target = $( e.target ),
                    $span = $( ".screen-indicator span[screen=#" + target.attr( "id" ) + "]" );

                $span.addClass( "live" )
                    .siblings( ".live" )
                    .removeClass( "live" );


                $( ".board-copy" ).remove();

                if ( !underControl ) {
                    clearInterval( boardTimer );
                    initStart();
                }
            }

        })
        .bind( "pageAnimationStart", function( e, info ) {
            /*
            if ( !isController ) return;

            var remote;

            if ( info.direction == "in" ) {
                remote = {
                    "isFun": false,
                    "type": "click",
                    "selector": "#nav a[href=#" + e.target.id + "]"
                }
            } else {
                remote = {
                    "isFun": true,
                    "method": "jQT.goBack()"
                }
            }

            send( JSON.stringify( remote ));
            */
        });

    /*
    if ( isIpad ) {
        $( "#jqt" ).swipe( function( e, info ) {
            var $live = $( ".screen-indicator .live" ),
                i = $live.attr( "screen" ).match( /\d/ ),
                screenNum = Math.ceil( Data.length / 8 );
        
            if ( info.direction == "left" ) {
                if ( i == screenNum - 1 ) {
                    return;
                } else {
                    i++;
                }
            } else if ( info.direction == "right" ) {
                if ( i == 0 ) {
                    return;
                } else {
                    i--;
                }
            }

            jQT.goTo( "#screen-" + i, "slide" + info.direction );
        });
    }
    */
}

window.initStart = function() {
    var $screen = $( $( "#screen-indicator .live" ).attr( "screen" ));
    var $board = $( ".board", $screen );
    var len = $board.length - 1;

    underControl = false;

    boardTimer = setInterval( function() {
        var $copy = $( ".board-copy" ),
            i = -1;

        if ( $copy.length ) {
            i = $copy.attr( "index" ) * 1;
        }

        if( i < 0 ) {
            $board.eq( 0 ).trigger( bindClick );
        } else if ( i < len ) {
            $board.eq( i ).next().trigger( bindClick );
        } else {
            $copy.find( ".board-min" ).trigger( bindClick );
            clearInterval( boardTimer );
            setTimeout( switchScreen, 2000 );
        }

    }, 8000);
}

window.initStop = function() {
    clearInterval( boardTimer );
    underControl = true;
}

function switchScreen() {
    var $live = $( "#screen-indicator  .live" ),
        $next = $live.next();

    if ( $next.length ) {
        $next.trigger( "click" );
    } else {
        $live.siblings().eq(0).trigger( "click" );
    }
}

function initIndicator() {
    var i = 0,
        html = "",
        screenNum = Math.ceil( Data.length / 8 );

    while( i < screenNum ) {
        if ( i == 0 ) {
            html += '<span class="live" screen="#screen-' + i + '"></span>'; 
        } else {
            html += '<span screen="#screen-' + i + '"></span>'; 
        }

        i++;
    }

    $( "#screen-indicator" ).html( html );
}

function formatNumber( num ) {
    num = num.toString();

    var arr = num.split(""),
        arr2 = [],
        j = 0;
        len = arr.length;

    for ( var i = len - 1; i >= 0 ; i-- ) {
        if ( j % 3 == 0 
            && i != len - 1) {
            arr2.push( "," );   
        }

        arr2.push( arr[i] );

        j++;
    }

    return arr2.reverse().join("");
}

function renderInstrument ( $instru, data, min, max ) {
    var degree = ( data - min ) / ( max - min ) * 132 + 24 + "deg";
    $( ".pointer", $instru )
        .css({
            "-webkit-transform": "rotate(" + degree + ")",
            "-moz-transform": "rotate(" + degree + ")"
        });
}
