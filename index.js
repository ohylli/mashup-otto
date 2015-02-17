var data = require( "./data" );
var server = require( "./server" );
var router = require( "./router" );
var requestHandlers = require( "./requestHandlers" );

var dbUrl = (process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/") +"mashup";
var handle = [];
handle["/"] = requestHandlers.start;
handle["/api/query/hkdata"] = requestHandlers.hkData;

data.initDbConnection( dbUrl, function() {
    server.start( router.route, handle );    
});