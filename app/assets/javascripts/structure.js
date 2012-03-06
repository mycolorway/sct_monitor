(function( $ ) {

var degree = 0;

$(function() {
    initEllipse();

    initOther();

    initCE();

	ws.connect();
});

function initEllipse() {
    var a = 411;
    var b = 71;
    var h = 411;
    var k = 71;
    var x, y;
    var t = 0;
    var $el = $( ".ellipse .ball" );
    var w = $el.width() / 2;

    setInterval( function() {
        degree += 1;
        t = degree / 180 * Math.PI;
        x = a * Math.cos( t ) + h - w;
        y = b * Math.sin( t ) + k - w; 

        $el.css({
            left: x,
            top: y
        });

    }, 20 );
}

function initOther() {
    var $aaa = $( ".other .aaa" );
    var aaaDirection = 1;

    var $ip = $( ".other .ip" );
    var ipDirection = 1;

    var $tdm0 = $( ".other .tdm-0" );
    var tdm0Direction = 1;

    var $tdm1 = $( ".other .tdm-1" );
    var tdm1Direction = 1;

    var $tdm = $( ".other .tdm" );
    var tdmDirection = 1;

    setInterval( function() {
        var aaaX = parseInt( $aaa.css( "left" )) + 1;
        var aaaY = parseInt( $aaa.css( "top" )) + 1;

        if ( aaaDirection ) {
            if ( aaaX > 187 ) {
                if ( aaaY > 274 ) {
                    aaaDirection = 0;
                } else {
                    $aaa.css({
                        "top": aaaY 
                    });
                }
            } else {
                $aaa.css({
                    "left": aaaX 
                });
            }
        } else {
            if ( aaaY < 210 ) {
                if ( aaaX < 48 ) {
                    aaaDirection = 1;
                } else {
                    $aaa.css({
                        "left": aaaX - 2
                    });
                }
            } else {
                $aaa.css({
                    "top": aaaY - 2
                });
            }
        }

        //ip
        var ipY = parseInt( $ip.eq(0).css( "top" )) + 1;

        if ( ipDirection ) {
            if ( ipY > 280 ) {
                ipDirection = 0;
            } else {
                $ip.css({
                    "top": ipY
                });
            }
        } else {
            if ( ipY < 213 ) {
                ipDirection = 1;
            } else {
                $ip.css({
                    "top": ipY - 2
                });
            }
        }

        //tdm-0
        var tdm0X = parseInt( $tdm0.css( "left" )) - 1;
        var tdm0Y = parseInt( $tdm0.css( "top" )) - 1;

        if ( tdm0Direction ) {
            if ( tdm0Y < 28 ) {
                if ( tdm0X < 310 ) {
                    tdm0Direction = 0;
                } else {
                    $tdm0.css({
                        "left": tdm0X 
                    });
                }
            } else {
                $tdm0.css({
                    "top": tdm0Y
                });
            }
        } else {
            if ( tdm0X > 360 ) {
                if ( tdm0Y > 82 ) {
                    tdm0Direction = 1;
                } else {
                    $tdm0.css({
                        "top": tdm0Y + 2
                    });
                }
            } else {
                $tdm0.css({
                    "left": tdm0X + 2
                });
            }
        }

        //tdm-1
        var tdm1X = parseInt( $tdm1.css( "left" )) + 1;
        var tdm1Y = parseInt( $tdm1.css( "top" )) - 1;

        if ( tdm1Direction ) {
            if ( tdm1Y < 28 ) {
                if ( tdm1X > 504 ) {
                    tdm1Direction = 0;
                } else {
                    $tdm1.css({
                        "left": tdm1X 
                    });
                }
            } else {
                $tdm1.css({
                    "top": tdm1Y
                });
            }
        } else {
            if ( tdm1X < 468 ) {
                if ( tdm1Y > 82 ) {
                    tdm1Direction = 1;
                } else {
                    $tdm1.css({
                        "top": tdm1Y + 2
                    });
                }
            } else {
                $tdm1.css({
                    "left": tdm1X - 2
                });
            }
        }

        //tdm
        var tdmX = parseInt( $tdm.eq(0).css( "left" )) + 1;

        if ( tdmDirection ) {
            if ( tdmX > 635 ) {
                tdmDirection = 0;
            } else {
                $tdm.css({
                    "left": tdmX
                });
            }
        } else {
            if ( tdmX < 560 ) {
                tdmDirection = 1;
            } else {
                $tdm.css({
                    "left": tdmX - 2
                });
            }
        }

    }, 20 );
}

function initCE() {
    var $ce0 = $( ".ce .ce-0" );
    var $ce1 = $( ".ce .ce-1" );
    var $ce2 = $( ".ce .ce-2" );
    var $ce3 = $( ".ce .ce-3" );

    setInterval( function() {
        var ce0Y = parseInt( $ce0.css( "top" )) + 1;

        if ( ce0Y > 120 ) {
            $ce0.css({
                "top": 12
            });
        } else {
            $ce0.css({
                "top": ce0Y
            });
        }

        var ce1Y = parseInt( $ce1.css( "top" )) + 1;

        if ( ce1Y > 120 ) {
            $ce1.css({
                "top": 40 
            });

            $ce2.css({
                "top": 40 
            });
        } else {
            $ce1.css({
                "top": ce1Y
            });

            $ce2.css({
                "top": ce1Y
            });
        }

        var ce3Y = parseInt( $ce3.css( "top" )) + 1;

        if ( ce3Y > 120 ) {
            $ce3.css({
                "top": 24
            });
        } else {
            $ce3.css({
                "top": ce3Y
            });
        }
    }, 20 );
}

})( jQuery );
