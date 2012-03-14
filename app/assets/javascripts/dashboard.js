(function( $ ) {

$( function() {

    $( '.dashboard-wrapper' ).height($( window ).height());
	$( '.dashboard-item' ).bind(isIpad ? 'touchstart tap' : 'mousedown', screenSelect);
	ws.connect();

});

function screenSelect( e ) {
    e.preventDefault();
    
    var target = $( e.currentTarget ),
        eData = {
            pageX: isIpad ? e.originalEvent.touches[0].pageX : e.pageX,
            pageY: isIpad ? e.originalEvent.touches[0].pageY : e.pageY
        };
       
    if ( isIpad ) {
        target.one( 'touchend.dashboard', selectStop );
        target.bind( 'touchmove.dashboard', eData, moveStart );
    } else {
        target.one( 'mouseup.dashboard', selectStop );
        target.bind( 'mousemove.dashboard', eData, moveStart );
    }
}

function moveStart( e ) {
    e.stopPropagation();

    var target = $( e.currentTarget );

    var pageX = isIpad ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY = isIpad ? e.originalEvent.touches[0].pageY : e.pageY;

    if ( Math.abs( pageX - e.data.originX ) < 5
            && Math.abs( pageY -  e.data.originY ) < 5 ) {
    
        return;
    }

    var eventData = {
        originX: e.data.pageX,
        originY: e.data.pageY,
        originLeft: parseInt( target.css( 'left' )) + pageX - target.offset().left - 100,
        originTop: parseInt( target.css( 'top' )) + pageY - target.offset().top - 75,
        pointers: []
    };

    target.siblings( '.dashboard-item' ).each( function( i, o ) {
        var $this = $( this ),
            pos = $this.position();

        eventData.pointers.push({
            'id': this.id,
            'x': pos.left,
            'y': pos.top
        });
    });

    var clone = target.clone( false );

    clone.appendTo( '.dashboard-nav' ).addClass( 'holder' );

    target.css({
        'left': eventData.originLeft,
        'top': eventData.originTop
    }).addClass( 'dragging' );

    if ( isIpad ) {
        target.unbind( 'touchend.dashboard' )
            .unbind( 'touchmove.dashboard' );

        target.bind( 'touchmove.dashboard', eventData, move );
        target.one( 'touchend.dashboard', moved );
    } else {
        target.unbind( 'mouseup.dashboard' )
            .unbind( 'mousemove.dashboard' );

        target.bind( 'mousemove.dashboard', eventData, move );
        target.one( 'mouseup.dashboard', moved );
    };
    
    function moved() {

        clone.bind( isIpad ? 'touchstart' : 'mousedown', screenSelect );

        if ( isIpad ) {
            clone.bind( 'tap', screenSelect );
        }
    
        clone.removeClass( 'holder' );
        target.remove();

        var drop = $( '.dashboard-item.drop' );

        if ( !drop.length ) { 
            return
        }

        drop.removeClass( 'drop' );

        var originEl = clone.find( 'a' ),
            dropEl = drop.find( 'a' );

        dropEl.hide();

        originEl.hide()
            .appendTo( drop )
            .slideDown( 400, function() {

            });

        dropEl.appendTo( clone ).delay(350).fadeIn( 300 );
                    
        var data = {
            from_guid: clone.find( 'a' ).attr( 'guid' ),
            to_guid: drop.find( 'a' ).attr( 'guid' )
        };
    
        $.ajax({
            url: '/order/change/',
            data: data,
            type: 'POST',
            dataType: 'json',
            success: function( result ) {
                if ( result.success && localStorage['iscontrol'] * 1 ) {
                    var json = {
                        'method': 'command',
                        'data': {
                            'isFun': true,
                            'method': 'changeScreen("' + data.from_guid + '", "' + data.to_guid + '")'
                        }
                    }

                    ws.inst.send( JSON.stringify(json) );
                }
            }
        });
    }
}

function isHover(x0, y0, x1, y1, distance ) {
    var deltaX = Math.abs( x1 - x0 ),
        deltaY = Math.abs( y1 - y0 ),
        delta = Math.sqrt( Math.pow( deltaX, 2 ) + Math.pow( deltaY, 2 ));

    if ( delta < distance ) {
        return true
    } else {
        return false
    }
}

function move( e ) {
    e.stopPropagation();
    var $this = $( this );

    var pageX = isIpad ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY= isIpad ? e.originalEvent.touches[0].pageY : e.pageY,
        offsetX = pageX - e.data.originX,
        offsetY = pageY - e.data.originY,
        left = e.data.originLeft,
        top = e.data.originTop;
        
    var newLeft = left + offsetX,
        newTop = top + offsetY,
        x0 = newLeft + $this.width()/2,
        y0 = newTop + $this.height()/2;

    $this.css({
        'left': newLeft,
        'top': newTop
    });

    $.each( e.data.pointers, function( i, o ) {
        var el = $( '#' + o.id ),
            x1 = el.width()/2 + parseInt( el.css( 'left' )),
            y1 = el.height()/2 + parseInt( el.css( 'top' ));

        if ( isHover( x0, y0, x1, y1, Math.max(el.width()/2, $this.width()/2) )) {
            if ( !el.hasClass( 'drop' )) {
                el.addClass( 'drop' )
                    .siblings( '.drop' ).removeClass( 'drop' );
            }
            
            return
        } else {
            el.removeClass( 'drop' );
        }
    });
}

function selectStop( e ) {
    if( isIpad ) {
        location.href = $( e.currentTarget ).find( 'a' ).attr( 'href' );
    }
}

window.exchange = {
    from: null, 
    to: null,
    i: 0,

    exec: function(from, to) {
        if ( !from ) from = $( '#dashboard-item-1 a' ).attr('guid');
        if ( !to ) to = $( '#dashboard-item-3 a' ).attr('guid');

        this.from = from;
        this.to = to;

        var fromElem = $( 'a[guid=' + from + ']' ).parent(),
            toElem = $( 'a[guid=' + to + ']' ).parent(),
            cssAnimation = document.createElement('style'),
            style = document.createTextNode('@-webkit-keyframes from {' +
                '0% { -webkit-transform: scale(1); }' +
                '50% { -webkit-transform: scale(1.2); }' +
                '100% { -webkit-transform: scale(1); left: ' + toElem.css('left') + '; top: ' + toElem.css('top') + '; }}' +
                '@-webkit-keyframes to {' +
                '0% { -webkit-transform: scale(1); }' +
                '50% { -webkit-transform: scale(1.2); }' +
                '100% { -webkit-transform: scale(1); left: ' + fromElem.css('left') + '; top: ' + fromElem.css('top') + '; }}');

        cssAnimation.type = 'text/css';
        cssAnimation.id = 'style-exchange';
        cssAnimation.appendChild(style);
        $( 'head' ).append(cssAnimation);

        fromElem.bind('webkitAnimationEnd', $.proxy(this.end, this));
        toElem.bind('webkitAnimationEnd', $.proxy(this.end, this));

        fromElem.addClass('exchangeFrom');
        toElem.addClass('exchangeTo');
    },

    end: function(e) {
        $( e.target ).unbind('webkitAnimationEnd')
            .removeClass('exchangeFrom exchangeTo');
        
        if ( this.i == 0 ) {
            this.i++;
        } else {
            var fromElem = $( 'a[guid=' + this.from + ']' ),
                toElem = $( 'a[guid=' + this.to + ']' ),
                fromWrap = fromElem.parent(),
                toWrap = toElem.parent();

            fromWrap.append(toElem);
            toWrap.append(fromElem);

            $( '#style-exchange' ).remove();
            this.i = 0;
        }
    }
}

})( jQuery );
