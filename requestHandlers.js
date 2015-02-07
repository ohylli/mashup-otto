function start( response )
{
    console.log( "show start page");
    response.writeHead( 200, { "content-type": "text/plain" } );
    response.write( "start page\n" );
    response.end();
}

function query( response )
{
    console.log( "make query" );
    response.writeHead( 200, { "content-type": "text/plain" } );
    response.write( "query result\n" );
    response.end();
}

exports.start = start;
exports.query = query;