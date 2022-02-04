'use strict';

// kirjoita tänne oma ohjelmakoodisi

var map;

$(function () {
	//Säädetään sivu näyttämään halutulta
	var mapDiv = $("#map");
	mapDiv.css("width", Math.round(window.innerWidth) * 0.98 + "px");
	mapDiv.css("height", Math.round(window.innerHeight) * 0.45 + "px");

	var lista = $(".lista");
	lista.css("width", Math.round(window.innerWidth) / 4 + "px");
	lista.css("height", Math.round(window.innerHeight) * 0.45 + "px");

	
	//Luodaan kartta
	//Tehdään rastikoordinaateista latlong-taulukko
	var rastiKoordinaatit = new Array();
	for (let rasti of data[2].rastit) {
		rastiKoordinaatit.push(L.latLng(rasti.lat, rasti.lon));
	}
	map = new L.map('map', {
		crs: L.TileLayer.MML.get3067Proj()
	}).fitBounds(L.latLngBounds(rastiKoordinaatit), [0, 0]);
	L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(map);

	//Piirretään rastit ympyröinä kartalle
	for (let x of rastiKoordinaatit) {
		piirraRasti(x, "red", map, 150);
	}

	//Luodaan lista joukkueista
	var i = 0;
	var j = 0;
	for (let sarja of data[2].sarjat) {
		j += sarja.joukkueet.length;
	}
	for (let sarja of data[2].sarjat) {
		for (let joukkue of sarja.joukkueet) {
			var li = $("<li>" + joukkue.nimi + "</li>").appendTo($("#joukkueet"));
			//li.attr("id", "joukkue" + i);
			li.attr("class", "joukkue");
			li.attr("draggable", "true");
			li.css("background-color", rainbow(j,i));
			li.on("dragstart", joukkueDragStart);
			li.on("dragend", joukkueDragEnd);
			i++;
		}
	}

	//Säädetään kartalla puolen drag & drop
	var kartalla = document.getElementById("kartalla");

	//Jotta Drop on mahdollista oltava preventdefault dragenterissa ja dragoverissa
	kartalla.addEventListener("dragenter", function(e){
		e.preventDefault();
	});
	kartalla.addEventListener("dragover", function(e){
		e.preventDefault();
	});
	kartalla.addEventListener("drop", kartallaDragDrop);

	function joukkueDragStart(){
		this.className = "dragged";
	}


});


function joukkueDragEnd(){
	this.className = "joukkue";
}

function kartallaDragDrop(e){
	e.preventDefault();
	var dragged = document.querySelector(".dragged")
	this.prepend(dragged);
	piirraReitti(dragged);
}

/**
 * Piirtää kohde-joukkueen reitin kartalle.
 * @param {li} kohde Joukkueen listaelementti
 */
function piirraReitti(kohde){
	var nimi = $(kohde).html();
	var color = $(kohde).css("background-color");
	var reitti = haeReitti(nimi);
	var polyline = L.polyline(reitti, {color: color});
	polyline.addTo(map);

}

/**
 * Hakee joukkueen kulkeman reitin
 * @param {string} nimi: Joukkueen nimi
 */
function haeReitti(nimi){
	var reitti = new Array();
	for (let sarja of data[2].sarjat){
		for (let joukkue of sarja.joukkueet){
			if (joukkue.nimi === nimi){
				var rastit = joukkue.rastit;
				break;
			}
		}
	}
	for (let rasti of rastit){
		if (rasti.aika !== ""){
			if (parseInt(rasti.rasti) !== 0){
				reitti.push(etsiRastiLatLng(parseInt(rasti.rasti)));
			}
		}	
	}
	return reitti;
}

/**
 * Hakee rastin lat-lon koordinaatit id-numeron perusteella
 * @param {int} id Rastin ID-numero
 */
function etsiRastiLatLng(id){
	for (let rasti of data[2].rastit){
		if (parseInt(rasti.id) === id){
			return [rasti.lat, rasti.lon];
		}
	}
}

/**
* Piirtää pyöreän ympyrän kartalle annettuihin koordinaatteihin
*/
function piirraRasti(latLng, color, map, radius) {
	var merkki = L.circle(
		latLng, {
			color: color,
			radius: radius
		}
	).addTo(map)
}

function rainbow(numOfSteps, step) {
	// This function generates vibrant, "evenly spaced" colours (i.e. no clustering).
	// This is ideal for creating easily distinguishable vibrant markers in Google Maps
	// and other apps.
	// Adam Cole, 2011-Sept-14
	// HSV to RBG adapted from: 
	// http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	let r, g, b;
	let h = step / numOfSteps;
	let i = ~~(h * 6);
	let f = h * 6 - i;
	let q = 1 - f;
	switch (i % 6) {
		case 0: r = 1; g = f; b = 0; break;
		case 1: r = q; g = 1; b = 0; break;
		case 2: r = 0; g = 1; b = f; break;
		case 3: r = 0; g = q; b = 1; break;
		case 4: r = f; g = 0; b = 1; break;
		case 5: r = 1; g = 0; b = q; break;
	}
	let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
	return (c);
}