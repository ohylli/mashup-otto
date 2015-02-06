var http = require( "http" );

var port = 9000;
function start()
{
    function onRequest( request, response ) 
    {
        response.writeHead( 200, { "content-type": "text/plain" } );
        response.write( "Hello, world!" );
        response.end();
    }
 
    var server = http.createServer( onRequest );
    server.listen( port );
    console.log( "The server has started. Listening on port " +port +"." );
}
 
exports.start = start;