function route( path, handle, response, request )
{
    console.log( "Routing a request for " +path );
    if ( typeof handle[path] === "function" )
    {
        handle[path]( response, request );
    }
    
    else
    {
        console.log( "route not found" );
        response.writeHead( 404, { "content-type": "text/html" } );
        response.write( "404 page not found.\n" );
        response.end()
    }
    
}

exports.route = route;