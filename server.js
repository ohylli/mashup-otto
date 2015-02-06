var http = require( "http" );
var url = require( "url" );

var port = 9000;
function start()
{
    function onRequest( request, response ) 
    {
        var path = url.parse( request.url ).pathname;
        console.log( "request to " +path );
        response.writeHead( 200, { "content-type": "text/plain" } );
        response.write( "Hello, world!" );
        response.end();
    }
 
    var server = http.createServer( onRequest );
    server.listen( port );
    console.log( "The server has started. Listening on port " +port +"." );
}
 
exports.start = start;