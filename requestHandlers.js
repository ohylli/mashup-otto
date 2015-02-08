var helmet = require("./helmet");

function start(response) {
    console.log("show start page");
    response.writeHead(200, {
        "content-type": "text/plain"
    });
    response.write("start page\n");
    response.end();
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
