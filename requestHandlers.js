var helmet = require("./helmet");
var fs = require("fs");
var nodepath = require( "path" );

function serveFile( path, response ) {
    var mediaTypes = {};
    mediaTypes[".html"] = "text/html";
    
    var filePath = process.cwd() +"/site" +path;
    var ext = nodepath.extname( filePath );
    console.log( "serving static file: " +filePath );
    response.writeHead( 200, { "content-type": mediaTypes[ext] });
    fs.createReadStream( filePath ).pipe( response );
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

exports.start = start;
exports.query = query;