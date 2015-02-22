# mashup-otto

A node.js based mashup application. I made this just to learn node.js so it is not really useful.

## Data sources

* Hong Kong Air Quality Healt Index: [http://www.gov.hk/en/theme/psi/datasets/pastaqhiaqms.htm](http://www.gov.hk/en/theme/psi/datasets/pastaqhiaqms.htm)
* Hong Kong current weather RSS: [http://rss.weather.gov.hk/rss/CurrentWeather.xml](http://rss.weather.gov.hk/rss/CurrentWeather.xml)

## Mashup

The weather and air quality data contain measurements from different stations. Some stations are present in both data sets though there are few of them. This mashup will show the current temperature and the air quality index of these places. The information is presented  in a table. The user can choose which places are shown: all, those with at least aqhi, those with at least temperature or those who have both.

## Installation

This mashup works either locally or it can be deployed to OpenShift. It requires node.js, NPM and a MongoDB database. The local installation is a normal NPM based installation:
```
git clone https://github.com/ohylli/mashup-otto.git
cd mashup-otto
npm install
npm start
```

Note: the application will not start if it cannot connnect to mongodb.

## How it works

- a HTTP server starts with node index.js
- it tries to establish connection with a local mongodb data base called mashup. If it fails the application aborts.
- the mongodb url is in a variable called dbUrl in index.js
- HTTP request to localhost:9000 returns the apps front page.
- The front page uses a Ajax http request to get the actual data.
- the port is defined in a variable called port in server.js
- HTTP request to /api/query/hkdata?type=value returns the weather / aqhi information as a html fragment containing a table. Value tells which stations to show.
- Each stations information is saved to mongodb and queried from there. The db is cleared after 10 minutes so that the information can be updated.
- other requests result in an attempt to serve a static file from site directory. If the path doesn't match any file the 404.html page is returned.
- the app writes quite a lot of stuff to the console about what it is doing

## Modules / files

- index.js: starts the application, defines requesthandler to path mappings
- server.js: http server code
- router.js: chooses a request handler based on the path
- requestHandlers.js: functions for dealing with different request paths
- data.js: gets the data from the sources, caches it to mongodb and queries the db based on the user request
- site/client.js: browser side javascript for getting the data from server