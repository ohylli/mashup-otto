var helmet = require( "./helmet" );
var server = require( "./server" );
var router = require( "./router" );
var requestHandlers = require( "./requestHandlers" );

var dbUrl = "mongodb://localhost:27017/mashup";
var handle = [];
handle["/"] = requestHandlers.start;
handle["/api/query/books"] = requestHandlers.query;

helmet.initDbConnection( dbUrl, function() {
    server.start( router.route, handle );    
});