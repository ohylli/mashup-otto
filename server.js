var http = require( "http" );
var url = require( "url" );

// the port the server listens on. If in openshift use the provided port.
var port = process.env.OPENSHIFT_NODEJS_PORT || 9000;
// openshift requires this
var serverIp = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// start a http server
function start( route, handle )
{
    function onRequest( request, response ) 
    {
        // handle a request by letting router choose the correct handler method
        var path = url.parse( request.url ).pathname;
        console.log( "request to " +path );
        route( path, handle, response, request );
    }
 
    var server = http.createServer( onRequest );
    server.listen( port, serverIp );
    console.log( "The server has started. Listening on port " +port +"." );
}
 
exports.start = start;