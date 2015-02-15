var xml2js = require( "xml2js" );
var request = require( "request");
var _ = require("lodash");
var cheerio = require('cheerio');

var aqhiUrl = 'http://www.aqhi.gov.hk/epd/ddata/html/out/24aqhi_Eng.xml';
var weatherUrl = 'http://rss.weather.gov.hk/rss/CurrentWeather.xml';

// aqhi['AQHI24HrReport']['item'][0]['StationName'][0]
// ['AQHI24HrReport']['item'][0]['aqhi'][0]
//  ['rss']['channel'][0]['item'][0]['description'][0]

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
                stations[station] = {
                    name: station,
                    temperature: temperature
                };
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
           for ( var i = 0; i < items.length; i++ ) {
               var name = items[i]['StationName'][0];
               if ( i == items.length -1 ||  name != items[i +1]['StationName'][0]  ) {
                   // this is the last i.e. the newest measurement from a station
                   if ( stations[name] ) {
                       stations[name].aqhi = Number( items[i]['aqhi'][0] );
                   }
               }
           }
           
           callback( null, stations );
       });
    });
}

function getData( callback ) {
    getWeather( function ( err, stations ) {
        if ( err ) {
            console.log( "Error in aquiring data.");
            callback( err );
            return;
        }
        
        getAqhi( stations, callback );
    });
}

exports.getData = getData;