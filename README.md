natura2000-bg
=============

Visualising buildings in Natura2000 


Getting the data
================

Get an OSM extract of Bulgaria

    

Extract all buildings using osmosis

    osmosis --read-xml sofia.osm --tf accept-ways building=yes --write-xml sofia_buildings.osm
    

Current workflow (manual)
=========================

Import ```sofia_buildings.osm``` in QGIS with the OpenStreetMap plugin. 
