var socket;

function connect( init ) {

    var host = "ws://106.187.42.238:1337/";

    try {
        if ( "WebSocket" in window ) {
            socket = new WebSocket( host );
        } else if ( "MozWebSocket" in window ) {
            socket = new MozWebSocket( host );
        } else {
            throw "Your client does not support WebSocket";
        }

        socket.onopen = function() {
            //alert( "Socket Status: " + socket.readyState + " (open)");
            var json = {
                "method": "register",
                "is_ipad": isIpad,
                "guid": guid,
                "uid": uid
            }
            
            send( JSON.stringify( json ));
        }

        socket.onmessage = function( msg ) {
            var json = JSON.parse( msg.data );
            
            if ( json.success ) {

                if ( init && $.isFunction( init )) init();

            } else if ( json.success == false ) {

                throw "registe fail"

            } else {
                if ( json.isFun ) {
                    eval( json.method );
                } else {
                    $( json.selector ).trigger( json.type );
                }
            }
        }

        socket.onclose = function() {
            //alert( "Socket Status: " + socket.readyState + " (closed)");
        }
    } catch( exception ) {
        alert( exception );
    }
}

function send( text ) {
    try {
        socket.send( text );
    } catch( exception ) {
        alert( exception );
    }
}

function sendCommand( json ) {
    json = {
        "method": "command",
        "data": JSON.stringify( json )
    };

    send( JSON.stringify( json ));
}

function initNav() {
    $( "#navigator" ).bind( "click", function( e ) {
        e.preventDefault();
        e.stopPropagation();

        var target =  $( e.currentTarget ),
            offset = target.offset(),
            $panel = $( "#nav-panel" );

        if ( $panel.is( ":visible" )) {
            $panel.hide()
            target.removeClass( "live" );
            $( document ).unbind( "click.nav" );
        } else {
            $panel.css({
                "top": offset.top + 20,
                "left": offset.left - 215,
                "display": "block"
            });
            target.addClass( "live" );

            $( document ).bind( "click.nav", function( e ) {
                var target = $( e.target );

                if ( target.is( "#nav-panel" )
                    || target.parents( "#nav-panel" ).length ) {
                    
                    return;
                }

                $panel.hide();
                $( "#navigator" ).removeClass( "live" );
                $( document ).unbind( "click.nav" );
            });
        }
    });
}

function changeScreen( from, to ) {
    if ( guid == from ) {
        location.href = "/matrix/" + to + "/";
    } else if ( guid == to ) {
        location.href = "/matrix/" + from + "/";
    }
}

$( function() {

    $( ".sys-time" ).jclock();

    $( ".navigator" ).click( function( e ) {
        e.preventDefault();

        location.href = "/dashboard/";
    });

    $( ".logout" ).click( function( e ) {
        e.preventDefault();

        location.href = "/logout/";
    });

    /*
    if ( isIpad ) {

        $( ".navigator" ).click( function( e ) {
            e.preventDefault();

            location.href = "/dashboard/";
        });

    } else {

        initNav();
    
    }*/

    $( "#controller, #viewer" ).bind( "click", function( e ) {
        e.preventDefault();

        var target = $( e.target ),
            $span = target.parent();

        if ( $span.hasClass( "live" )) return;

        $span.addClass( "live" )
            .siblings( ".live" )
            .removeClass( "live" );
    });
 
});
