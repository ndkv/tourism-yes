natura2000-bg
=============

Visualising Bulgarian buildings that are contained in the Natura2000 zones. 


Getting data
================

Get an OSM extract of Bulgaria through OSM's eXtended API as

    curl --location --globoff "http://www.overpass-api.de/api/xapi?*[bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg.osm

Get only buildings as

    curl --location --globoff "http://www.overpass-api.de/api/xapi?way[building=yes][bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg_buildings.osm
    

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

* Get BG extract through XAPI
* Extract buildings with osmosis OR directly with XAPI
* Convert to GML using [osm2shp.py](http://wiki.openstreetmap.org/wiki/Converting_OSM_to_GML) > convert to shapefiles using ogr2ogr OR insert in PostGIS with osmosis or [osm2postgresql](http://wiki.openstreetmap.org/wiki/Osm2postgresql)
* Intersect building footprints with Natura2000 using e.g. Shapely OR in database using spatial functions e.g. ST_Intersects/ST_Within
* Output intersections and display with headless Tilemill > mbtiles > MapProxy OR mapnik > MapProxy
