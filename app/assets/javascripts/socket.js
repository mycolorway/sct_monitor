var ws = {
    host: 'ws://127.0.0.1:1337/',
	inst: null,
	debug: true,
	iscontrol: 0,
	pw: 'whosyourdaddy',
	
	connect: function() {
		try {
			if ( 'WebSocket' in window ) {
				this.inst = new WebSocket( this.host );
			} else if ( 'MozWebSocke' in window ) {
				this.inst = new MozWebSocket( this.host );
			} else {
				throw 'Your client does not support WebSocket';
			}

			this.inst.onopen = this.onopen;
			this.inst.onmessage = this.onmessage;
			this.inst.onclose = this.onclose;
			this.inst.oncontrol = this.oncontrol;
			this.inst.oncontroloff = this.oncontroloff;

		} catch ( exception ) {
			alert( exception );
		}
	},

	onopen: function() {
		if ( ws.debug ) ws.print( 'Socket Status: ' + this.readyState + ' (open)');

		debugger
		var json = {
			'method': 'register',
			'uid': uid
		}

		if ( localStorage['iscontrol'] * 1 ) {
			json.password = ws.pw;
		}
		
		this.send( JSON.stringify(json) );
	},

	onmessage: function( msg ) {
				   debugger
		var json = JSON.parse( msg.data );

		if ( ws.debug ) ws.print( json );

		if ( json.msg && json.msg == 'control off' ) {
			if ( this.oncontroloff && $.isFunction(this.oncontroloff) ) this.oncontroloff();
			localStorage['iscontrol'] = ws.iscontrol = 0;

			return
		}

		if ( ws.iscontrol ) return
		
		if ( json.msg && json.msg == 'control on' ) {
			if ( this.oncontrol && $.isFunction(this.oncontrol) ) this.oncontrol();
			localStorage['iscontrol'] = ws.iscontrol = 1;
			
			return
		}

		if ( json.isFun ) {
			eval( json.method );
		} else {
			$( json.selector ).trigger( json.type );
		}
	},

	onclose: function() {
		if ( ws.debug ) ws.print( 'Socket Status: ' + this.readyState + ' (closed)');
	},

	oncontrol: null,
	oncontroloff: null,

	print: function( msg ) {
		console.log( msg );
	}

}

var socket;

function connect( init ) {

    var host = 'ws://106.187.42.238:1337/';

    try {
        if ( 'WebSocket' in window ) {
            socket = new WebSocket( host );
        } else if ( 'MozWebSocket' in window ) {
            socket = new MozWebSocket( host );
        } else {
            throw 'Your client does not support WebSocket';
        }

        socket.onopen = function() {
            //alert( 'Socket Status: ' + socket.readyState + ' (open)');
            var json = {
                'method': 'register',
                'uid': uid
            }
            
            socket.send( JSON.stringify(json) );
        }

        socket.onmessage = function( msg ) {
            var json = JSON.parse( msg.data );
            
            if ( json.success ) {

                if ( init && $.isFunction( init )) init();

            } else if ( json.success == false ) {

                throw 'registe fail'

            } else {
                if ( json.isFun ) {
                    eval( json.method );
                } else {
                    $( json.selector ).trigger( json.type );
                }
            }
        }

        socket.onclose = function() {
            //alert( 'Socket Status: ' + socket.readyState + ' (closed)');
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
        'method': 'command',
        'data': JSON.stringify( json )
    };

    send( JSON.stringify( json ));
}

function initNav() {
    $( '#navigator' ).bind( 'click', function( e ) {
        e.preventDefault();
        e.stopPropagation();

        var target =  $( e.currentTarget ),
            offset = target.offset(),
            $panel = $( '#nav-panel' );

        if ( $panel.is( ':visible' )) {
            $panel.hide()
            target.removeClass( 'live' );
            $( document ).unbind( 'click.nav' );
        } else {
            $panel.css({
                'top': offset.top + 20,
                'left': offset.left - 215,
                'display': 'block'
            });
            target.addClass( 'live' );

            $( document ).bind( 'click.nav', function( e ) {
                var target = $( e.target );

                if ( target.is( '#nav-panel' )
                    || target.parents( '#nav-panel' ).length ) {
                    
                    return;
                }

                $panel.hide();
                $( '#navigator' ).removeClass( 'live' );
                $( document ).unbind( 'click.nav' );
            });
        }
    });
}

function changeScreen( from, to ) {
    if ( guid == from ) {
        location.href = '/matrix/' + to + '/';
    } else if ( guid == to ) {
        location.href = '/matrix/' + from + '/';
    }
}

$( function() {

    $( '.sys-time' ).jclock();

    $( '.navigator' ).click( function( e ) {
        e.preventDefault();

        location.href = '/dashboard/';
    });

    $( '.logout' ).click( function( e ) {
        e.preventDefault();

        location.href = '/logout/';
    });

    /*
    if ( isIpad ) {

        $( '.navigator' ).click( function( e ) {
            e.preventDefault();

            location.href = '/dashboard/';
        });

    } else {

        initNav();
    
    }*/

    $( '#controller, #viewer' ).bind( 'click', function( e ) {
        e.preventDefault();

        var target = $( e.target ),
            $span = target.parent();

        if ( $span.hasClass( 'live' )) return;

        $span.addClass( 'live' )
            .siblings( '.live' )
            .removeClass( 'live' );
    });

	$( '#controller' ).bind('click', function(e) {
		e.preventDefault();

		var key = window.prompt('请输入控制密码：');
		var d = {
			'method': 'control_on',
			'uid': uid,
			'password': key
		};

		ws.inst.send( JSON.stringify(d) );
	});

	$( "#viewer" ).click(function(e) {
		e.preventDefault();

		var json = {
			'method': 'control_off',
			'uid': uid
		}

		ws.inst.send( JSON.stringify(json) );
	});
 
});
