var xml2js = require( "xml2js" );
var request = require( "request");
var _ = require("lodash");
var cheerio = require('cheerio');
var mongodb = require( "mongodb" );

var aqhiUrl = 'http://www.aqhi.gov.hk/epd/ddata/html/out/24aqhi_Eng.xml';
var weatherUrl = 'http://rss.weather.gov.hk/rss/CurrentWeather.xml';

var dataCollection = null;
var cacheClearDelay = 1000 *60 *10;

function initDbConnection( dbUrl, callback ) {
    console.log( "Connecting to mongodb at " +dbUrl );
    var mongoClient = mongodb.MongoClient;
    mongoClient.connect( dbUrl, function( err, db ) {
        if ( !err ) {
            console.log( "connection to database formed." );
            db.collection( "hkdata", function ( err, collection ) {
                if ( err ) {
                    console.log( "could not get the hkdata  collection." );
                    console.log( err );
                    return;
                } 
                
                dataCollection = collection;                
                // if there are cached query results remove them
                clearDb();
                callback();
            });
            
        }
        
        else {
            console.log ( "failed to connect to database. Server will not be started.");
            console.log( err );
        }
    });
}

function clearDb() {
    console.log( "Clearing the cached query result." );
    dataCollection.remove( function () {});
}

function getWeather( callback ) {
    request( weatherUrl, function ( err, response, body ) {
        if ( err || response.statusCode != 200 ) {
            console.log( "error in fetching the weather data.");
            callback( err );
            return;
        }
        
        xml2js.parseString( body, function ( err, data ) {
            if ( err ) {
                console.log( "Error in parsing the weather data.");
                callback( err );
                return;
            }
            
            var html = data['rss']['channel'][0]['item'][0]['description'][0];
            var $ = cheerio.load( html );
            var rows = $('tr');
            var stations = {};
            _.forEach( rows, function( row ) {
                var tds = $('td', row );
                var station = $(tds[0]).text();
                var temperature = Number( $(tds[1]).text().split( ' ' )[0] );
                // there can also be rain information in another table which is formated differently
                if ( !isNaN( temperature ) ) {
                    stations[station] = {
                        name: station,
                        temperature: temperature
                    };
                }
            });
            
            callback( null, stations );
        });
    });
}

function getAqhi( stations, callback ) {
    request( aqhiUrl, function( err, response, body ) {
        if ( err ) {
            console.log( "Could not fetch aqhi data.");
            callback( err );
            return;
        }
        
       xml2js.parseString( body, function( err, data ) {
           if ( err ) {
               console.log( "erro in parsing the aqhi data." );
               callback( err );
               return;
           }
           
           var items = data['AQHI24HrReport']['item'];
           _.each( items, function( item, index ) {
               var name = item['StationName'][0];
               if ( index == items.length -1 ||  name != items[index +1]['StationName'][0]  ) {
                   // this is the last i.e. the newest measurement from a station
                   var station = stations[name];
                   if ( !station ) {
                       station = { name: name };
                       stations[name] = station;                       
                   }
                   
                   station.aqhi = Number( item['aqhi'][0] );
               }
           });
           
           callback( null, stations );
       });
    });
}

function getDataFromWeb( callback ) {
    getWeather( function ( err, stations ) {
        if ( err ) {
            callback( err );
            return;
        }
        
        getAqhi( stations, function ( err, stations ) {
            if ( err ) {
                callback( err );
                return;
            }
            
            var stationList =  Object.keys( stations ).map( function ( key ) { return stations[ key ]; });
            dataCollection.insert( stationList, {w:1}, function ( err, result ) {
                if ( err ) {
                    console.log( "failed to insert query result to database." );
                    callback( err );
                    return;
                }
                
                console.log( "Query result inserted to database.");
                setTimeout( clearDb, cacheClearDelay );
                callback();
            });
        });
    });
}

function getData( type, callback ) {
    // this is used to get the data the user ants from the db
    // but first we check if db has data
    // if not we get it from the web.
    function getFromDb( err ) {
        if ( err ) {
            callback( err );
            return;
        }

        var exists = { $exists: true };
        var queries = {
            both: { aqhi: exists, temperature: exists },
            aqhi: { aqhi: exists },
            weather: { temperature: exists },
            all: {}
        };
        dataCollection.find( queries[type] ).toArray(  function ( err, items ) {
            if ( err ) {
                console.log( "cannot read data from db." );
                callback( err );
                return;
            }            
            
            callback( null, items );
        });
    }
    
    dataCollection.findOne( function ( err, item ) {
        if ( err || !item) {
            console.log( "nothing in database.");
            getDataFromWeb( getFromDb  );
            return;
        }
        
        console.log( "data found from db." );
        getFromDb();
    });
    
}


exports.getData = getData;
exports.initDbConnection = initDbConnection;