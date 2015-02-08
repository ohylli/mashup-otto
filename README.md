# mashup-otto

A node.js based mashup application. I made this just to learn node.js so it is not really useful.

## Data sources

* Hong Kong Air Quality Healt Index: [http://www.gov.hk/en/theme/psi/datasets/pastaqhiaqms.htm](http://www.gov.hk/en/theme/psi/datasets/pastaqhiaqms.htm)
* Hong Kong current weather RSS: [http://rss.weather.gov.hk/rss/CurrentWeather.xml](http://rss.weather.gov.hk/rss/CurrentWeather.xml)
* Possible some more [Hong Kong open data sets](http://www.gov.hk/en/theme/psi/datasets/)

## Mashup

The weather and air quality data contain measurements from different stations. Some stations are present in both data sets though there are few of them. This mashup will show the current temperature and the air quality index of these places. The information is presented at least in a table and possibly some sort of visualisation. My main interest is in the back end so the front end may not be so pretty.

## Current features of the application

The application is in early development and some features are only for general node.js testing. The following things work currently:

- a HTTP server starts with node index.js
- it tries to establish connection with a local mongodb data base called mashup. If it fails the application aborts.
- mongodb module is needed npm install mongodb
- the mongodb url is in a variable called dbUrl in index.js
- HTTP request to localhost:9000 returns a text "start page"
- the port is defined in a variable called port in server.js
- HTTP request to /api/query/books returns a book list from helmet library search
- This search result is cached into mongodb and used in following responses
- other requests result in HTTP 404

The application consists of following modules:

- index.js: starts the application
- server.js: http server code
- router.js: chooses a request handler based on the path
- requestHandlers.js: functions for dealing with different request paths
- helmet.js: deals with querying the helmet API and caching the result to mongodb