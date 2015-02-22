var data = require( "./data" );
var server = require( "./server" );
var router = require( "./router" );
var requestHandlers = require( "./requestHandlers" );

// use a local mongodb or if in openshift the one provided by openshift
var dbUrl = (process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/") +"mashup";

// map request paths to handler functions
var handle = [];
handle["/"] = requestHandlers.start;
handle["/api/query/hkdata"] = requestHandlers.hkData;

// connect to the mongodb used in caching data
data.initDbConnection( dbUrl, function() {
    // start the http server
    server.start( router.route, handle );    
});