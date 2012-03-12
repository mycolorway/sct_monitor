var ws = {
    //host: 'ws://127.0.0.1:1337/', # use get_host() instead
	inst: null,
	debug: true,
	iscontrol: 0,
	pw: 'whosyourdaddy',
	
	get_host: function() {
	    return 'ws://' + location.hostname + ':1337/'; 
	},
	
	connect: function() {
		try {
			if ( 'WebSocket' in window ) {
				this.inst = new WebSocket( this.get_host() );
			} else if ( 'MozWebSocke' in window ) {
				this.inst = new MozWebSocket( this.get_host() );
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

		var json = {
			'method': 'register',
			'uid': uid
		}

		if ( localStorage['iscontrol'] * 1 ) {
			$( '#controller' ).parent()
				.addClass('live')
				.siblings('.live')
				.removeClass('live');

			json.password = ws.pw;
		}
		
		this.send( JSON.stringify(json) );
	},

	onmessage: function( msg ) {
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

		if ( json.msg && json.msg == 'already has controller' ) {
			alert( '已经存在控制者, 您无法进入控制模式' );
			$( '#viewer' ).parent()
				.addClass('live')
				.siblings('.live')
				.removeClass('live');
		
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

function changeScreen( from, to ) {
    if ( !window.guid ) {
        location.reload();
        return
    }

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

		localStorage.removeItem('iscontrol');
        location.href = '/logout/';
    });

    $( '#controller, #viewer' ).bind('click', function( e ) {
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
