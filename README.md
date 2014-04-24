[tourism=yes](http://apps.ndkv.nl/tourism=yes)
 visualises buildings located in Bulgarian parks, reserves and protected nature zones. Building footprints are fetched from OpenStreetMap and intersected with a number of Bulgarian nature reserves. The footprints are categorized based on their ```tourism``` tag value. 

The goal is to show the locations and extent of nature reserves in Bulgaria, show and verify the presence and locations of tourist buildings and spot dodgy buildings i.e. non-touristic buildings in nature parks such as private chalets, mass tourism hotels on mountain peaks, etc.

Additionally, viewers are invited to contribute to OSM by correcting mistakes, amending existing objects and/or adding new ones. 


CartoDB API
-----------
The application is powered by [CartoDB](http://www.cartodb.com) which means that you get a [powerful SQL API](http://developers.cartodb.com/documentation/sql-api.html) for free. You can query the ```buildings``` and ```nature_areas``` tables by firing a GET request at 

    http://simeon.cartodb.com/api/v2/sql?q=SELECT count(*) FROM buildings

and/or

    http://simeon.cartodb.com/api/v2/sql?q=SELECT count(*) FROM nature_areas
    
Getting all buildings with an empty ```tourism``` tag is done as

    http://simeon.cartodb.com/api/v2/sql?q=SELECT * FROM buildings WHERE tourism ISNULL    
    
CartoDB runs on PostGIS which means you can do nifty geo stuff like

    http://simeon.cartodb.com/api/v2/sql?q=SELECT ST_Area(the_geom) FROM nature_areas LIMIT 10
    
The SQL API can handle GET and POST request which allows you to retrieve data through e.g. jQuery as

    $.getJSON('http://simeon.cartodb.com/api/v2/sql/?q=SELECT count(*) FROM Buildings', function(data) {
        $.each(data.rows, function(key, val) {
        // do something!
      });
    });
    
Or through [CartoDB.js](http://developers.cartodb.com/documentation/cartodb-js.html#sec-3-16) as 

    cartodb.createLayer(map, 'http://simeon.cartodb.com/api/v2/viz/46345544-6d62-11e3-99da-5404a6a69006/viz.json', function(layer) {
        layer.createSubLayer({
            sql: 'SELECT * FROM buildings',
            cartocss: '#layer { marker-fill: red; }'
        });
    }).addTo(map);


Roll your own
=============
*The remainder of this document describes how to map an area of your choice*. The instructions are written for Ubuntu 12.04 and assume you have a working PostGIS configuration (scroll to the bottom if you need help setting it up). The result of the described process is a list of buildings that lie within nature areas that you can host on MapBox / CartoDB / GeoServer, etc. 

The buildings footprints come from [OpenStreetMap](www.openstreetmap.org/about) whereas the [nature reserve areas](http://pdbase.government.bg/zpo/bg/index.jsp) come from the Bulgarian [Executive Environment Agency](http://eea.government.bg/en).


Building footprints
-------------------
Building data can come from anywhere; OpenStreetMap is great for this project as Bulgarian open data isn't a rich as, say, [Dutch data](http://citysdk.waag.org/buildings/).

There are numerous ways of getting OSM data. Here we'll use the [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API)'s [XAPI endpoint](http://wiki.openstreetmap.org/wiki/Overpass_API/XAPI_Compatibility_Layer). We get everything that OSM knows about Bulgaria by quering the API with ```curl``` as

    curl --location --globoff "http://overpass.osm.rambler.ru/cgi/xapi?*[bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg.osm

The API is quite sophisticated and allows for numerous filters and quries. For instance, we can extract only the building footprints as

    curl --location --globoff "http://overpass.osm.rambler.ru/cgi/xapi?way[building=yes][bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg_buildings.osm

Nature reserves
---------------------
The most probable place to get information about nature reserves in your area is to look for your province/region/country's [spatial data portal](http://www.geo.admin.ch/internet/geoportal/en/home.html). If you can not find such a thing have a look at the areas designated in the European Union's [Natura2000](http://en.wikipedia.org/wiki/Natura_2000) directive:
    
[Natura2000 2 dataset](http://www.eea.europa.eu/data-and-maps/data/natura-2)

[Natura2000 3 dataset](http://www.eea.europa.eu/data-and-maps/data/natura-3)

[Natura2000 4 dataset](http://www.eea.europa.eu/data-and-maps/data/natura-4)

Store and manage data
=====================
PostGIS is an extension to PostgreSQL that handles spatial data. Storing the OSM extract in a spatial database allows us to perform spatial queries and analyses such as bounding box searches, intersections, area calculations, coordinate transformations, etc. all of which are indexed and hence super fast. 


OpenStreetMap
-------------
Importing ```bg_buildings.osm``` in PostGIS is painless thanks to the efforts of the OSM community. They've written several utilities that interact with databases. One of them, ```osm2pgsql```, is a nifty command line utility that converts the OSM datastructure to a GIS friendly format and inserts it in PostGIS.

On Ubuntu you can get ```osm2pgsql``` from Kai Krueger's Launchpad [repository](https://launchpad.net/~kakrueger/+archive/openstreetmap) as

    sudo add-apt repository ppa:kakrueger/openstreetmap
    sudo apt-get update
    sudo apt-get install osm2pgsql

Once you have ```osm2pgsql``` you can populate the database with

    osm2pgsql -U postgres -H localhost -W -d osm -l bg_buildings.osm

```osm2pgsql``` creates four tables: point, line and polygon representations of the OSM geometries and a separate table that contains the roads. We'll use the ```planet_osm_polygons``` table later to intersect the OSM building footprints it contains with the nature reserve areas. 

Nature reserves
----------------
The most probable format you'll find government data in is esri's Shapefile which you can insert in PostGIS with the ```shp2pgsql``` utility as

    shp2pgsql -d -I -i -s 4326 reserves.shp reserves > insert.sql

```shp2pgsql``` produces a SQL script that you can read with PostGIS' command-line interface ```psql``` as

    psql -U postgres -h localhost -d osm -f insert.sql    

This creates a ```reserves``` table in the ```osm``` database.

Modify and analyse data
=======================
Features in government datasets are often coded in mysterious ways. In the current case the nature reserves are denoted by a three character code in the format BGn where n goes from 1 to 6. We add an additional column to the ```reserves``` table to hold more meaningful designators. 

    ALTER TABLE reserves
    ADD zone_class char;

Map code abbreviations to zone types as

    UPDATE reserves
    SET zone_class = "parks"
    WHERE desig_abbr = "BG5";

Now that we have all the data in the databse we can perform spatial queries. The one needed here is an intersection of all OSM buildings with all nature reserve areas. In PostGIS this is done by calling the ```ST_Intersects``` function as
    
    SELECT osm_id, desig_abbr, name, tourism, amenity, way 
    FROM planet_osm_polygon, reserves
    WHERE ST_Intersects(way, geom);

We can write the result of this query to a Shapefile using the ```pgsql2shp``` utility as

    pgsql2shp -f buildings -h localhost -u postgres osm "SELECT osm_id, desig_abbr, name, tourism, amenity, way FROM planet_osm_polygon, reserves where ST_Intersects(way, geom)"

We can also use ```ogr2ogr``` to write the result to different formats e.g. GeoJSON as

    ogr2ogr -f GeoJSON buildings.shp PG:"dbname='' host='' user='' password=''" -sql "SELECT osm_id, desig_abbr, name, tourism, amenity, way FROM planet_osm_polygon, reserves WHERE ST_intersects(way, geom)"

**Note** ```ogr2ogr``` is your Swiss army knife when dealing with geo data. Knowing only a little bit about it will make your life significantly more pleasant.


Manual / databaseless workflow
==============================
Don't want to bother with databases? You can perform the same analysis manually with QGIS. 


* Import ```bg_buildings.osm``` in QGIS with the OpenStreetMap plugin. The plugin generates three layers: points, lines and polygons. The latter contains the building footprints. 
* Intersect building footprints with the geometries of your reserves using the built-in QGIS vector tools. 
* Export the result as a Shapefile or GeoJSON and load in e.g. Tilemill / CartoDB
* Done! 

Other considerations
====================

Filtering OSM data with ```osmosis```
-------------------------------------
[osmosis](http://wiki.openstreetmap.org/wiki/Osmosis) is a command line application for processing OSM data. ```osmosis``` is super handy when you're working with data from e.g. OpenStreetMap.org's [exporter](http://www.openstreetmap.org/export), [Metro Extracts](http://metro.teczno.com/#sofia) or similar)

Extract buildings from a larger OSM extract

    osmosis --read-xml bg.osm --tf accept-ways building=yes --write-xml bg_buildings.osm
        
Simplifying geometries
----------------------
The nature reserve geometries might be too detailed for the mapping engine or hosting solution of choice (in this case CartoDB). A workaround is to simplify them in order to reduce the file size and lower the strain on the rendering engine. PostGIS can do that for you as 

    SELECT sitetype, ST_Simplify(geom, 0.000025) FROM reserves

Installing and configuring PostGIS on Ubuntu
============================================

TODO
