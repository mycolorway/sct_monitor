(function( $ ) {

var dataCache = [];
var warnChart;
var dominoPageIndex = 0;
var marqueeTimes = 0;
var timer = [];
var againTimer;
var marqueeStart = [];
var dominoTimer;

$(function() {
    $.ajax({
        url: "/data/get/alert/0/",
        type: "POST",
        dataType: "json",
        success: function( result ) {
            window.Data = dataCache[0] = result;

            if ( userType == 0 ) {
                //普通用户
            } else if ( userType == 1 ) {
                //大屏
                connect();
            } else if ( userType == 2 ) {
                //控制者
                $( "#controller" ).click( function( e ) {
                    e.preventDefault();

                    connect();

                    $( ".warn-nav span" ).click( function( e ) {
                        var index = $( e.target ).attr( "index" );
                        
                        sendCommand({
                            "isFun": true,
                            "method": "$('.warn-nav span[index=" + index + "]').click()"
                        });
                    });
                });

                $( "#viewer" ).click( function( e ) {
                    e.preventDefault();

                    if ( !(socket && socket.readyState == 1 )) {
                        return;
                    }

                    var t = setInterval( function() {
                        if ( socket.bufferedAmount == 0 ) {
                            socket.close();
                            clearInterval( t );
                        }
                    }, 50);
                });
            }

            initStart();

            $( ".warn-nav" ).bind( "click", nav );
        }
    });

    $.ajax({
        url: "/data/get/alert/1/",
        type: "POST",
        dataType: "json",
        success: function( result ) {
            dataCache[1] = result;
        }
    });

    $.ajax({
        url: "/data/get/alert/2/",
        type: "POST",
        dataType: "json",
        success: function( result ) {
            dataCache[2] = result;
        }
    });
});

window.initStart = function() {
    renderSummary();
    renderWarn();   
    
    domino( $( "table div.domino-board" ), 0 );
}

function renderSummary() {
    $( "#unhandle-num" ).text( Data.undone_num );
    $( "#handled-num" ).text( Data.done_num );

    var l1 = Data.l1_num;
    var l2 = Data.l2_num;
    var l3 = Data.l3_num;
    var sum = l1 + l2 + l3;

    var w1 = Math.round( l1 / sum * 480 );
    var w2 = Math.round( l2 / sum * 480 );
    var w3 = Math.round( l3 / sum * 480 );

    $( ".bar-secondary" ).text( l3 ).width( w3 );
    $( ".bar-main" ).text( l2 ).width( w2 );
    $( ".bar-emergency" ).text( l1 ).width( w1 );
}

function domino( $tds, i ) {
    if ( i == $tds.length ) { //当前页所有滚动结束
        var pagesAmount = Math.floor( Data.alerts.length / 6 - 1 );

        if ( dominoPageIndex == pagesAmount ) { //已经显示到最后一页了
            dominoPageIndex = -1;
        }

        setMarquee(); //设置滚动
        return;
    }
    
    var row = Math.floor( i / 6 ),
        data = Data.alerts[ row + dominoPageIndex * 6 ],
		content = buildDominoDom( data, i % 6 );

    $tds.eq(i)
        .bind( "webkitAnimationEnd", dominoAnimationEnd )
        .addClass( "out" )
        .after( '<div class="domino-board in">' + content + '</div>' );

    dominoTimer = setTimeout( function() { //200ms后翻下一个board
        i++;
        domino( $tds, i );
    }, 150 );
}

function buildDominoDom( data, column ) {
    var content = "";

    switch( column ) {
        case 0: {
            content = '<div class="mask"><span>' + data.content + '</span></div>';
            break;
        }
        case 1: {
            content = data.time;
            break;
        }
        case 2: {
            var cls = "";

            if ( data.level == 1 ) {
				cls = "emergency";
				content = "紧急";
            } else if ( data.level == 2 ) {
				cls = "main";
				content = "主要";
            } else if ( data.level == 3 ) {
				cls = "secondary";
				content = "次级";
            } else {
                content = "";
            }

            content = '<span class=' + cls + '><b></b>' + content + '</span>';
            break;
        }
        case 3: {
            content = data.duration;
            break;
        }
        case 4: {
            content = data.point_type;
            break;
        }
        case 5: {
            content = data.alert_type;
            break;
        }
        default: {
            break;
        }
    }

    return content;
}

function dominoAnimationEnd() {
    $( this ).remove();
}

function setMarquee() {
    var moving = 0;

    marqueeTimes++;
    timer = [];

    $( "table .mask" ).each( function( i ) {
        var $mask = $( this ),
            $span = $mask.find( "span" ),
            delta = $span.width() - $mask.width();

        if ( delta <= 0 ) return;

        $span.css( "left", 0 );

        moving++;

        var marquee = function() {
            var left = parseInt( $span.css( "left" ) || 0 );

            if ( Math.abs( left ) < delta ) { //还需要移动
                $span.css( "left", left - 1 );
                return
            }

            //移到头了
            clearInterval( timer[i] );
            moving--;

            if ( moving > 0 ) return //还有没滚完的

            if ( marqueeTimes == 2 ) { //当前所有的已经滚完两次了
                marqueeTimes = 0;
                dominoPageIndex++;
                domino($( "table div.domino-board" ), 0); 
            } else {
                againTimer = setTimeout( function() { //延迟2s再滚一次
                    setMarquee();
                }, 1500);
            }
        }

        marqueeStart[i] = setTimeout( function() {
            timer[i] = setInterval( marquee, 20 );
        }, 4000 );
    });
}

function renderWarn() {
    warnChart = new Highcharts.Chart({
        chart: {
            renderTo: "warn-chart",
            backgroundColor: "transparent",
            marginTop: 60,
            marginLeft: 60,
            marginRight: 40
        },
        colors: [
            //"#148088",
            "#1b83b3",
            "#fac763"
        ],
        credits: {
            enabled: false 
        },
        title: {
            text: " ",
            /*
            style: {
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "STHeiti, Heiti, Arial, sans-serif"
            }
            */
        },
        /*
        subtitle: {
            align: "right",
            floating: true,
            text: "单位：万户",
            style: {
                color: "#aaaaaa"
            },
            y: 14 
        },
        */
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
            categories: [
                "01月",
                "02月",
                "03月",
                "04月",
                "05月",
                "06月",
                "07月",
                "08月",
                "09月",
                "10月",
                "11月",
                "12月",
            ],
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
                var year = ( new Date()).getFullYear();

                return year + "年" + this.x + " <b>"
                        + this.points[0].y + "</b> <br/>同比 <b>" + this.points[1].y 
                        + "</b>";
            },
            style: {
                "fontSize": "12px",
                "padding": "5px",
                "lineHeight": "18px"
            }
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                marker: {
                    enabled: false
                }
            },
            spline: {
                lineWidth: 3,
                marker: {
                    enabled: false,
                }
            }
        },
        series: [{
            type: "column",
            name: "本月",
            data: Data.chart[0]
        }, {
            type: "spline",
            name: "同比",
            data: Data.chart[1]
        }]
    });
}

function nav( e ) {
    e.preventDefault();

    var target = $( e.target ),
        live = target.siblings( ".live" );

    if ( target.hasClass( "live" )) return;

    //停下动画，置位，让滚动停下，
    $.each( timer, function() {
        if ( this ) {
            clearInterval( this );
        }
    });
    $.each( marqueeStart, function() {
        if ( this ) {
            clearInterval( this );
        }
    });
    clearTimeout( againTimer );
    clearTimeout( dominoTimer );

    setTimeout( function() {
        Data = dataCache[ target.attr( "index" ) * 1 ];
        dominoPageIndex = 0;
        marqueeTimes = 0;
        
        initStart();
    }, 2000 );
    
    target.addClass( "live" );
    live.removeClass( "live" );
}

})( jQuery );
