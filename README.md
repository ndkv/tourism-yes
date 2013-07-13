natura2000-bg
=============

Visualising Bulgarian buildings that are contained in the Natura2000 zones. 


Getting data
================

Get an OSM extract of Bulgaria 

    curl --location --globoff "http://www.overpass-api.de/api/xapi?*[bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg.osm

Get only BG buildings

    curl --location --globoff "http://www.overpass-api.de/api/xapi?way[building=yes][bbox=22.394248233556354,41.235366211879473,28.633039945734783,44.213393561835581]" -o bg_buildings.osm
    

Filtering data
==============

Extract buildings from OSM extract using osmosis (handy when downloading data from e.g. http://metro.teczno.com/#sofia or similar)

    osmosis --read-xml bg.osm --tf accept-ways building=yes --write-xml bg_buildings.osm
    

Current workflow (manual)
=========================

Import ```bg_buildings.osm``` in QGIS with the OpenStreetMap plugin.
