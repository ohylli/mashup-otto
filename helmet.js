var http = require( "http" );

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
            
            callback( books );
        });

    }).on("error", function(e) {
        console.log("Error: ", e);
    });
}
exports.getBooks = getBooks;
