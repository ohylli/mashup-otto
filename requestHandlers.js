var data = require('./data');
var fs = require("fs");
var nodepath = require( "path" );
var url = require("url");
var _ = require('lodash');

// serves a static file from the site directory
// status is the http status for the response
function serveFile( path, response, status ) {
    if ( status === undefined )
    {
        status = 200;
    }

    // map file extensions to http media types
    var mediaTypes = {};
    mediaTypes[".html"] = "text/html";
    mediaTypes['.css'] = "text/css";
    mediaTypes['.js'] = "text/javascript";
    
    // what file we try to serve
    var filePath = process.cwd() +"/site" +path;
    // get the file extension so we can find the correct media type
    var ext = nodepath.extname( filePath );
    console.log( "serving static file: " +filePath );
    response.writeHead( status, { "content-type": mediaTypes[ext] });
    var file = fs.createReadStream( filePath ).on( "error", function() {
        // file not found. serve the error page
        serveFile( "/404.html", response, 404 );
    });
    // pipe the files content to the response body.
    file.pipe( response );
}

// show the front page
function start(response) {
    console.log("show start page");
    serveFile( "/index.html", response );
}

// get the aqhi and temperature data
function hkData( response, request ) {
    // urls query tells which stations to show
    var type = url.parse( request.url, true ).query['type'];
    console.log( "Query for station type: " +type );
    data.getData( type, function ( err, stations ) {
        response.writeHead( 200, { "content-type": 'text/html' } );
        if ( err ) {
            // something went wrong in fetching the data
            console.log( err );
            response.write( "<p>Unfortunately there was an error in fetching the data. Please try again later.</p>")
            response.end();
            return;
        }

        // build a html fragment containing a table which has the data
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