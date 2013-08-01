natura2000-bg
=============

Visualising Bulgarian buildings that are contained in the Natura2000 zones. 


Getting data
================

Open Street Map
---------------

Get an OSM extract of Bulgaria through OSM's eXtended API (XAPI) as

    curl --location --globoff "http://www.overpass-api.de/api/xapi?* \
    [bbox=22.394248233556354, 41.235366211879473,28.633039945734783,44.213393561835581]" \
    -o bg.osm

Get only buildings as

    curl --location --globoff "http://www.overpass-api.de/api/xapi?way[building=yes] \ 
    [bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" \
    -o bg_buildings.osm
    
    
Natura2000
----------
    
Full 2012 dataset: http://www.eea.europa.eu/data-and-maps/data/natura-2

Partial (missing GIS data) 2013 dataset: http://www.eea.europa.eu/data-and-maps/data/natura-3

Filtering data
==============

Extract buildings from OSM extract using osmosis (handy when downloading data from e.g. http://metro.teczno.com/#sofia or similar)

    osmosis --read-xml bg.osm --tf accept-ways building=yes --write-xml bg_buildings.osm
        

Manual workflow (current)
=========================

* Import ```bg_buildings.osm``` in QGIS with the OpenStreetMap plugin.
The plugin generates three layers: points, lines and polygons. The latter contains the building footprints. 
* Intersect building footprints with Natura 2000 zones (in this case only with Vitosha Nature Park).
* Export intersections from QGIS as e.g. GeoJSON and load in Tilemill
* Style, generate mbtiles and upload to MapBox

Automated workflow (future)
===========================

Get OSM BG extract through XAPI as described above. 

Extract buildings with osmosis OR directly with XAPI.

Insert in PostGIS with ```osm2pgsql```

    osm2pgsql -U postgres -H localhost -W -d osm -S default.style -l data.osm

Insert Natura2000 polygon in PostGIS using ```ogr2ogr```

    ogr2ogr -f PostgreSQL PG:"dbname='' host='' \
    user='' password=''" natura2000_bg.geojson

Intersect building footprints with Natura2000 in database using spatial functions e.g. ST_Intersects/ST_Within as
    
    SELECT osm_id, tourism, way 
    FROM planet_osm_polygon, ogrgeojson 
    WHERE ST_Intersects(osmbuildings.way, natura2000.geometry);

Output intersections and display with headless Tilemill > mbtiles > MapProxy OR mapnik > MapProxy

Simplify Natura2000 geometries

    SELECT sitetype, ST_Simplify(wkb_geometry, 0.000025) FROM ogrgeojson
