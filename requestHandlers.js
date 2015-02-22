var data = require('./data');
var fs = require("fs");
var nodepath = require( "path" );
var url = require("url");
var _ = require('lodash');

function serveFile( path, response, status ) {
    if ( status === undefined )
    {
        status = 200;
    }
    
    var mediaTypes = {};
    mediaTypes[".html"] = "text/html";
    mediaTypes['.css'] = "text/css";
    mediaTypes['.js'] = "text/javascript";
    
    var filePath = process.cwd() +"/site" +path;
    var ext = nodepath.extname( filePath );
    console.log( "serving static file: " +filePath );
    response.writeHead( status, { "content-type": mediaTypes[ext] });
    var file = fs.createReadStream( filePath ).on( "error", function() {
        serveFile( "/404.html", response, 404 );
    });
    file.pipe( response );
}

function start(response) {
    console.log("show start page");
    serveFile( "/index.html", response );
}

function hkData( response, request ) {
    var type = url.parse( request.url, true ).query['type'];
    console.log( "Query for station type: " +type );
    data.getData( type, function ( err, stations ) {
        response.writeHead( 200, { "content-type": 'text/html' } );
        if ( err ) {
            console.log( err );
            response.write( "<p>Unfortunately there was an error in fetching the data. Please try again later.</p>")
            response.end();
            return;
        }
        
        response.write( "<table><thead><th>Station</th><th>Temperature</th><th>aqhi</th></thead><tbody>\n");
        _.each( stations, function ( item ) {
            var temperature = item.temperature || "";
            var aqhi = item.aqhi || "";
            response.write( "<tr><td>" +item.name +"</td><td>" +temperature +"</td><td>" +aqhi +"</td></tr>\n");
        });
        response.write( "</tbody></table>" );
        response.end();
    });
}

exports.serveFile = serveFile;
exports.start = start;
exports.hkData = hkData;