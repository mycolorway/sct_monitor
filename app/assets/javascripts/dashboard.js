(function( $ ) {

window.isIPad = navigator.userAgent.match(/iPad/i) ? true : false;

$( function() {

    $( ".dashboard-wrapper" ).height( $( window ).height());

    if ( userType == 1 ) {

        connect();

    } else if ( userType == 2 ) {
        //控制者
        $( ".dashboard-item" ).bind( isIPad ? "touchstart" : "mousedown", screenSelect );

        if ( isIPad ) {
            $( ".dashboard-item" ).bind( "tap", screenSelect );
        }        

        connect();
    }
    
});

function screenSelect( e ) {
    e.preventDefault();

    
    var target = $( e.currentTarget ),
        eData = {
            pageX: isIPad ? e.originalEvent.touches[0].pageX : e.pageX,
            pageY: isIPad ? e.originalEvent.touches[0].pageY : e.pageY
        };
       
    if ( isIPad ) {
        target.one( "touchend.dashboard", selectStop );
        target.bind( "touchmove.dashboard", eData, moveStart );
    } else {
        target.one( "mouseup.dashboard", selectStop );
        target.bind( "mousemove.dashboard", eData, moveStart );
    }
}

function moveStart( e ) {
    e.stopPropagation();

    var target = $( e.currentTarget );

    var pageX = isIPad ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY = isIPad ? e.originalEvent.touches[0].pageY : e.pageY;

    if ( Math.abs( pageX - e.data.originX ) < 5
            && Math.abs( pageY -  e.data.originY ) < 5 ) {
    
        return;
    }

    var eventData = {
        originX: e.data.pageX,
        originY: e.data.pageY,
        originLeft: parseInt( target.css( "left" )) + pageX - target.offset().left - 100,
        originTop: parseInt( target.css( "top" )) + pageY - target.offset().top - 75,
        pointers: []
    };

    target.siblings( ".dashboard-item" ).each( function( i, o ) {
        var $this = $( this ),
            pos = $this.position();

        eventData.pointers.push({
            "id": this.id,
            "x": pos.left,
            "y": pos.top
        });
    });

    var clone = target.clone( false );

    clone.appendTo( ".dashboard-nav" ).addClass( "holder" );

    target.css({
        "left": eventData.originLeft,
        "top": eventData.originTop
    }).addClass( "dragging" );

    if ( isIPad ) {
        target.unbind( "touchend.dashboard" )
            .unbind( "touchmove.dashboard" );

        target.bind( "touchmove.dashboard", eventData, move );
        target.one( "touchend.dashboard", moved );
    } else {
        target.unbind( "mouseup.dashboard" )
            .unbind( "mousemove.dashboard" );

        target.bind( "mousemove.dashboard", eventData, move );
        target.one( "mouseup.dashboard", moved );
    };
    
    function moved() {

        clone.bind( isIPad ? "touchstart" : "mousedown", screenSelect );

        if ( isIPad ) {
            clone.bind( "tap", screenSelect );
        }
    
        clone.removeClass( "holder" );
        target.remove();

        var drop = $( ".dashboard-item.drop" );

        if ( !drop.length ) { 
            return
        }

        drop.removeClass( "drop" );

        var originEl = clone.find( "a" ),
            dropEl = drop.find( "a" );

        dropEl.hide();

        originEl.hide()
            .appendTo( drop )
            .slideDown( 400, function() {

            });

        dropEl.appendTo( clone ).delay(350).fadeIn( 300 );
                    
        var data = {
            from_guid: clone.find( "a" ).attr( "guid" ),
            to_guid: drop.find( "a" ).attr( "guid" )
        };

        if ( userType == 2 ) {
            sendCommand({
                "isFun": true,
                "method": "changeScreen('" + data.from_guid + "', '" + data.to_guid + "')"
            });
        }
    
        $.ajax({
            url: "/order/change/",
            data: data,
            type: "POST",
            dataType: "json",
            success: function( result ) {
                if ( result.success ) {
                    
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

    var pageX = isIPad ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY= isIPad ? e.originalEvent.touches[0].pageY : e.pageY,
        offsetX = pageX - e.data.originX,
        offsetY = pageY - e.data.originY,
        left = e.data.originLeft,
        top = e.data.originTop;
        
    var newLeft = left + offsetX,
        newTop = top + offsetY,
        x0 = newLeft + $this.width()/2,
        y0 = newTop + $this.height()/2;

    $this.css({
        "left": newLeft,
        "top": newTop
    });

    $.each( e.data.pointers, function( i, o ) {
        var el = $( "#" + o.id ),
            x1 = el.width()/2 + parseInt( el.css( "left" )),
            y1 = el.height()/2 + parseInt( el.css( "top" ));

        if ( isHover( x0, y0, x1, y1, Math.max(el.width()/2, $this.width()/2) )) {
            if ( !el.hasClass( "drop" )) {
                el.addClass( "drop" )
                    .siblings( ".drop" ).removeClass( "drop" );
            }
            
            return
        } else {
            el.removeClass( "drop" );
        }
    });
}

function selectStop( e ) {
    if( isIPad ) {
        location.href = $( e.currentTarget ).find( "a" ).attr( "href" );
    }
}

})( jQuery );
