var http = require( "http" );
var mongodb = require( "mongodb" );

var bookCollection = null;

function initDbConnection( dbUrl, callback ) {
    console.log( "Connecting to mongodb at " +dbUrl );
    var mongoClient = mongodb.MongoClient;
    mongoClient.connect( dbUrl, function( err, db ) {
        if ( !err ) {
            console.log( "connection to database formed." );
            db.collection( "bookQueries", function ( err, collection ) {
                if ( err ) {
                    console.log( "could not get the bookQueries collection." );
                    console.log( err );
                    return;
                } 
                
                bookCollection = collection;                
                callback();
            });
            
        }
        
        else {
            console.log ( "failed to connect to database. Server will not be started.");
            console.log( err );
        }
    });
}

function getBooks( callback ) {
    // helper function for converting the year string into a number
    // required because some years begin with a letter
    var yearToNumber = function(yearStr) {
        if (isNaN(yearStr[0])) {
            yearStr = yearStr.substring(1, yearStr.length);
        }

        return Number(yearStr);
    };

    var url = 'http://metadata.helmet-kirjasto.fi/search/author.json?query=Campbell';
    http.get(url, function(res) {
        var body = "";

        res.on("data", function(chunk) {
            body += chunk;
        });

        res.on("end", function() {
            var authorRes = JSON.parse(body);
            var books = [];
            for (var i = 0; i < authorRes.records.length; i++) {
                var id = authorRes.records[i].library_id;
                var title = authorRes.records[i].title;
                var year = yearToNumber(authorRes.records[i].year);
                books.push({
                    id: id,
                    title: title,
                    year: year
                });

                // console.log(title, ", ", year);
            }

            bookCollection.insert( { result: books }, {w:1}, function ( err, result ) {
                if ( err ) {
                    console.log( "failed to insert query result to database." );
                    return;
                }
                console.log( "Query result inserted to database.");
            });
            callback( books );
        });

    }).on("error", function(e) {
        console.log("Error: ", e);
    });
}
exports.getBooks = getBooks;
exports.initDbConnection = initDbConnection;