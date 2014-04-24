window.onload = run;

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
		
		layer.on('featureOver', function(e, pos, latlng, data) {
			cartodb.log.log(e, pos, latlng, data);
		});
		
		layer.on('error', function(err) {
			cartodb.log.log('error: ' + err);
		});
	}).on('error', function() {
		cartodb.log.log("some error occured");
	});
	
	var zoomFS = new L.Control.ZoomFS();
	map.addControl(zoomFS);
	
	map.on('enterFullscreen', function() {
		console.log('fullscreen');
		document.getElementById("legend").style.display = 'none';
		document.getElementById("about").style.display = 'none';
	});
	
	map.on('exitFullscreen', function() {
		document.getElementById("legend").style.display = 'block';
		document.getElementById("about").style.display = 'block';
	});
	
    //var vis = cartodb.createVis('map', '//http://simeon.cartodb.com/api/v2/viz/46345544-6d62-11e3-99da-5404a6a69006/viz.json');
}
