var requestHandlers = require('./requestHandlers');

function route( path, handle, response, request )
{
    console.log( "Routing a request for " +path );
    if ( typeof handle[path] === "function" )
    {
        handle[path]( response, request );
    }
    
    else
    {
        console.log( "route not found. Trying to serve a static file.");
        requestHandlers.serveFile( path, response );
    }
    
}

exports.route = route;