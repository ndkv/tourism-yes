window.onload = run;

function filter(layer) {
	var query = "SELECT ST_centroid(the_geom) as the_geom, ST_centroid(the_geom_webmercator) as the_geom_webmercator, cartodb_id, desig_abbr, tourism, name, osm_id FROM buildings";
	var previous = null;

	var queries = {
		"suspicious": query + " WHERE desig_abbr = 'BG06' AND tourism is null",
		"undefined": query + " WHERE desig_abbr != 'BG06' AND tourism is null",
		"park": query + " WHERE desig_abbr = 'BG06' AND tourism is not null"
	}

	$("#legend div").click(function(e) {
		var selection = $(this).attr("id");
		//removes filter whenever we click again on the same filter button
		if (previous === selection) {
			layer.setSQL(query);
			previous = null;
		} else {
			layer.setSQL(queries[selection]);
			previous = selection;
		}
	});
}

function run() {
    var map = new L.map('map', {zoomControl: false});
	map.setView([42.5657, 25.5123], 7);
	
	/*
	L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
          attribution: 'Stamen'
    }).addTo(map);
	*/
	
	var g = new L.Google('HYBRID');
	map.addLayer(g);
	
	cartodb.createLayer(map, 'http://simeon.cartodb.com/api/v2/viz/46345544-6d62-11e3-99da-5404a6a69006/viz.json')
	.addTo(map)
	.on('done', function (layer) {
	    layer.setInteraction(true);
		
		//layer.on('featureOver', function(e, pos, latlng, data) {
		//	cartodb.log.log(e, pos, latlng, data);
		//});
		
		layer.on('error', function(err) {
			cartodb.log.log('error: ' + err);
		});

		filter(layer.getSubLayer(2));

	}).on('error', function() {
		cartodb.log.log("some error occured");
	});
	

	//fullscreen control
	var zoomFS = new L.Control.ZoomFS();
	map.addControl(zoomFS);
	
	//catch fullscreen event and hide the legend and about divs
	//(they otherwise stay visible on top of the map)
	map.on('enterFullscreen', function() {
		//console.log('fullscreen');
		document.getElementById("legend").style.display = 'none';
		document.getElementById("about").style.display = 'none';
	});
	
	map.on('exitFullscreen', function() {
		document.getElementById("legend").style.display = 'block';
		document.getElementById("about").style.display = 'block';
	});


	//filters



}
