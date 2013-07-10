_.each(Shader.shaders, function( _fn, shader ) {
     $.ajax({
         url: 'shaders/' + shader + '.html',
         success: function( result ) {
             $('<div></div>').attr( 'id', shader ).html( result ).appendTo( document.body );
         },
         async: false
    });
});
