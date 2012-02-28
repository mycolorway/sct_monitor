(function( $ ) {

function login( e ) {
    e.preventDefault();

    var target = $( e.target ),
        data = {
            username: $( "#username" ).val(),
            password: $( "#password" ).val()
        };
    
    /*
    if ( !data.username
            || data.username == "邮箱" ) {
        $( "#error" ).text( "请输入您的登录邮箱" );
        return;
    } else if ( !data.password ) {
        $( "#error" ).text( "请输入您的登录密码" );
        return;
    }
    */

    //tinyLoading.show( target );

    $.ajax({
        url: "/login/",
        type: "POST",
        data: {
            data: JSON.stringify( data )
        },
        dataType: "json",
        success: function( result ){
            if ( result.success ) {
                location.href = "/dashboard/";
            } else {
                /*
                tinyLoading.hide( target );
                $( "#error" ).text( "邮箱或密码错误" );

                clearTimeout( _timer_ );

                _timer_ = setTimeout( function() {
                    $( "#error" ).text( "" );
                }, 5000 );
                */
            }
        }
    }); 
}

$( function() {

    $( ".login-wrapper" ).height( $( window ).height() - 150 );

    setTimeout( function() {

        $( ".login-light" ).fadeIn( 2000, "swing" );

        $( ".login-panel" ).fadeIn( 2000, "easeInOutQuad" );

    }, 300 );


    $( "#btn-login" ).click( login );

});

})( jQuery );
