var server = require( "./server" );
var router = require( "./router" );
var requestHandlers = require( "./requestHandlers" );

var handle = [];
handle["/"] = requestHandlers.start;
handle["/api/query/books"] = requestHandlers.query;

server.start( router.route, handle );