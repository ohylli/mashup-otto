var xml2js = require( "xml2js" );
var request = require( "request");
var _ = require("lodash");
var cheerio = require('cheerio');
var mongodb = require( "mongodb" );

// url for the aqhi information
var aqhiUrl = 'http://www.aqhi.gov.hk/epd/ddata/html/out/24aqhi_Eng.xml';
// url for the weather rss
var weatherUrl = 'http://rss.weather.gov.hk/rss/CurrentWeather.xml';

// the mondodb collection for the data
var dataCollection = null;
// how long (in ms) untill the db will be cleared after fetching the data
var cacheClearDelay = 1000 *60 *10;

// connect to the db and get the collection for the data
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

// clear cached data from db
function clearDb() {
    console.log( "Clearing the cached query result." );
    dataCollection.remove( function () {});
}

// get the temperature data
function getWeather( callback ) {
    request( weatherUrl, function ( err, response, body ) {
        if ( err || response.statusCode != 200 ) {
            console.log( "error in fetching the weather data.");
            callback( err );
            return;
        }
        
        // get the html containing the data from the rss feed
        xml2js.parseString( body, function ( err, data ) {
            if ( err ) {
                console.log( "Error in parsing the weather data.");
                callback( err );
                return;
            }
            
            var html = data['rss']['channel'][0]['item'][0]['description'][0];
            var $ = cheerio.load( html );
            // the data is in the first  table: name, temperature
            var table = $("table")[0];
            var rows = $('tr', table );
            var stations = {};
            _.forEach( rows, function( row ) {
                var tds = $('td', row );
                // name
                var station = $(tds[0]).text();
                // temperature info like "19 degrees"
                var temperature = Number( $(tds[1]).text().split( ' ' )[0] );
                stations[station] = {
                    name: station,
                    temperature: temperature
                };
            });
            
            callback( null, stations );
        });
    });
}

// get the air quality information which is added to stations
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
           
           // measurements from the stations
           var items = data['AQHI24HrReport']['item'];
           _.each( items, function( item, index ) {
               var name = item['StationName'][0];
               if ( index == items.length -1 ||  name != items[index +1]['StationName'][0]  ) {
                   // this is the last i.e. the newest measurement from a station
                   var station = stations[name];
                   // if there is no station object for this name create it otherwise add to the existing one
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

// gets and combines the temperature and aqhi data from the web sources
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

            // save each station as a separate document to mongodb
            var stationList =  Object.keys( stations ).map( function ( key ) { return stations[ key ]; });
            dataCollection.insert( stationList, {w:1}, function ( err, result ) {
                if ( err ) {
                    console.log( "failed to insert query result to database." );
                    callback( err );
                    return;
                }
                
                console.log( "Query result inserted to database.");
                // clear the db after some time so we can get updated data from the web
                setTimeout( clearDb, cacheClearDelay );
                callback();
            });
        });
    });
}

// get the aqhi and temperature data
function getData( type, callback ) {
    // this is used to get the data the user ants from the db
    // but first we check if db has data
    // if not we get it from the web.
    function getFromDb( err ) {
        if ( err ) {
            callback( err );
            return;
        }
        
        // mongodb query objects for different user inputs i.e. station types
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
    
    // do we have something in the db or to we have to get the data first from the web
    dataCollection.findOne( function ( err, item ) {
        if ( err || !item) {
            console.log( "nothing in database.");
            // get data from web and then the users query can be performed from the db
            getDataFromWeb( getFromDb  );
            return;
        }
        
        console.log( "data found from db." );
        getFromDb();
    });
    
}


exports.getData = getData;
exports.initDbConnection = initDbConnection;