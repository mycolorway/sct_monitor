var ws = {
    //host: 'ws://127.0.0.1:1337/', # use get_host() instead
	inst: null,
	debug: true,
	iscontrol: 0,
	pw: 'demo',
	is_connected: false,
	
	get_host: function() {
	    return 'ws://' + location.hostname + ':1337/'; 
	},
	
	connect: function() {
		try {
			if ( 'WebSocket' in window ) {
				this.inst = new WebSocket( this.get_host() );
			} else if ( 'MozWebSocket' in window ) {
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
		
		ws.is_connected = true;

		var json = {
			'method': 'register',
			'uid': uid
		}

		if ( localStorage['iscontrol']*1 ) {
			json.password = ws.pw;
		}
		
		this.send( JSON.stringify(json) );
	},

	onmessage: function( msg ) {
		var json = JSON.parse( msg.data );

		if ( ws.debug ) ws.print( json );

        // every body receive if no controller, 
        // or only ex-controller receive when replaced by another one
		if ( json.msg && json.msg == 'control off' ) {
			if ( this.oncontroloff && $.isFunction(this.oncontroloff) ) this.oncontroloff();
            localStorage['iscontrol'] = ws.iscontrol = 0;
		
			var viewer = $( '#viewer' ).parent();

            if ( !viewer.hasClass('live') ) {
                viewer.addClass( 'live' )
                    .siblings( '.live' )
                    .removeClass( 'live' );

                alert( '你已经退出了控制模式' );
            }

			return
		}

		if ( ws.iscontrol ) return
		
		// only receive by the current controller
		if ( json.msg && json.msg == 'control on' ) {
			if ( this.oncontrol && $.isFunction(this.oncontrol) ) this.oncontrol();

            var controller = $( '#controller' ).parent();

            if ( !controller.hasClass('live') ) {
                controller.addClass('live')
                    .siblings('.live')
                    .removeClass('live');
            }

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
		
		var situation = ws.is_connected ? '掉线了' : '没连上服务器';
		
		if ( confirm('啊咧，{s}。要刷新一下试试么?\nPS: 如果一直这样，点取消，报告管理员。'.replace('{s}', situation)) ) {
            location.reload();
        }
	},

	oncontrol: null,
	oncontroloff: null,

	print: function( msg ) {
		console.log( msg );
	}

}

function changeScreen( from, to ) {
    if ( !window.guid && exchange ) {
        exchange.exec(from, to);
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

	$( '#controller' ).bind('click', function(e) {
		e.preventDefault();

		if ( $( e.target ).parent().hasClass('live') ) return

		var key = window.prompt('请输入控制密码：');
            d = {
                'method': 'control_on',
                'uid': uid,
                'password': key
            };

		ws.inst.send( JSON.stringify(d) );
	});

	$( "#viewer" ).click(function(e) {
		e.preventDefault();

		if ( $( e.target ).parent().hasClass('live') ) return

		var json = {
			'method': 'control_off',
			'uid': uid
		}

		ws.inst.send( JSON.stringify(json) );
	});
 
});
