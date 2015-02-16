var helmet = require("./helmet");
var data = require('./data');

var fs = require("fs");
var nodepath = require( "path" );
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

function query(response) {
    console.log("make query");
    helmet.getBooks(function(books) {
        response.writeHead(200, {
            "content-type": "application/json"
        });
        
        console.log( books );
        response.write( JSON.stringify( books ));
        response.end();
    });
}

function hkData( response ) {
    data.getData( function ( err, stations ) {
        response.writeHead( 200, { "content-type": 'text/html' } );
        if ( err ) {
            console.log( err );
            response.end();
            return;
        }
        
        response.write( "<table><thead><th>Station</th><th>Temperature</th><th>aqhi</th></thead><tbody>");
        _.each( stations, function ( item ) {
            response.write( "<tr><td>" +item.name +"</td><td>" +item.temperature +"</td><td>" +item.aqhi +"</td></tr>");
        });
        response.write( "</tbody></table>" );
        response.end();
    });
}

exports.serveFile = serveFile;
exports.start = start;
exports.query = query;
exports.hkData = hkData;