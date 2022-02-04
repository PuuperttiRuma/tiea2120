// voit tutkia tarkemmin käsiteltäviä tietorakenteita konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt1/2018/data.json

// Seuraavilla voit tutkia käytössäsi olevaa tietorakennetta. Voit ohjelmallisesti
// vapaasti muuttaa selaimen muistissa olevan rakenteen sisältöä ja muotoa.

// console.log(data);

//console.dir(data);

// Kirjoita tästä eteenpäin oma ohjelmakoodis

"use strict";


function tulostaJoukkueet(){
	for (let sarja of data.sarjat){
		for (let joukkue of sarja.joukkueet){
			console.log(joukkue.nimi);
		}
	}
}

function muokkaaJoukkue(joukkue, sarjaan){
	for (let sarja of data.sarjat){
		if (sarja.nimi === sarjaan){
			sarja.joukkueet.push(joukkue);
		}
	}
}

function poistaJoukkue(poistettavaJoukkue){
	for (let sarja of data.sarjat){
		for (let joukkue of sarja.joukkueet){
			if (joukkue.nimi === poistettavaJoukkue){
				sarja.joukkueet.splice(sarja.joukkueet.indexOf(joukkue),1);
				break;
			}
			
		}
	}
}
			

function tulostaRastit(){
	let teksti = "";
	for (let rasti of data.rastit){
		if (parseInt(rasti.koodi)){
			teksti = teksti + rasti.koodi + "; "; //Ei tulosteta parseInt(rasti) koska halutaan koko rastin nimi
		}
	}
	console.log(teksti);
}

var mallijoukkue = {
    "nimi": "Mallijoukkue",
    "last": "2017-09-01 10:00:00",
    "jasenet": [
        "Tommi Lahtonen",
        "Matti Meikäläinen"
        //"Tommi Haapanen"
    ],
    "id": 99999
};

/**
 * @description: Etsii rasti-objektin annetusta datasta käyttäen ID:tä.
 * @param {int} rastin ID
 * @return {object} rasti, null jos ei löydy
 */
function etsiRasti(id) {
	var idInt = parseInt(id);
	for (let rasti of data.rastit) {
		if (idInt === parseInt(rasti.id) ) {
			return rasti;
		}
	}
	return null;
}

/**
 * @summary: Olio joka pitää sisällään käytyjen rastien olennaiset tiedot.
 *
 * @prop {int} koodi: Rastin koodi
 * @prop {float} lat: Rastin leveyspiirikoordinaatti
 * @prop {float} lon: Rastin pituuspiirikoordinaatti
 * @prop {Date} aika: Aika jona rastilla on käyty
 */
function KaytyRasti(koodi, lat, lon, aika){
	this.koodi = koodi;
	this.lat = lat;
	this.lon = lon;
	this.aika = new Date(aika);
}

/**
 * @summary: 		Listaa joukkueen kiertämät rastit.
 * @description:	Listaus on tehty käyttäen KaytyRasti objekteja, joissa on
					listattuna rastin koodi, positio ja aika milloin joukkue
					on rastilla käynyt.
 * @param {object}: joukkue
 * @return {Array}: joukkueen käymät KaytyRasti ajan mukaan järjestettynä
 */
function etsiKaydytRastit(joukkue){
	var kaydytRastit = new Array();
	var rasti = null;
	for (let tupa of data.tupa){
		if (joukkue.id === tupa.joukkue){
			rasti = etsiRasti(tupa.rasti);
			if (rasti){
				let kaytyRasti = new KaytyRasti(rasti.koodi, rasti.lat, rasti.lon, tupa.aika);
				if ( !kaydytRastit.includes(kaytyRasti) ) {					
					kaydytRastit.push(kaytyRasti);
				}
			}
		}		
	}
	kaydytRastit.sort(function (a, b) {
		return a.aika - b.aika;
	});
	return kaydytRastit;
}

/**
 * @summary: Laskee joukkueen rasteja kiertämällä keräämät pisteet.
 * @description: 	Joukkue saa pisteitä rastin koodin ensimmäisen merkin
 *					verran. Esim. jos koodi on 9A, siitä saa 9 pistettä. 					
 *					Jos rastin koodin ensimmäinen merkki ei ole kokonais-
 *					luku, rastista ei saa pisteitä.
 * @param: {Set} joukkueen käymät rastit
 * @return: {Int} Lasketut pisteet
 */
function laskePisteet(kaydytRastit) {
	var pisteet = 0;
	for (let rasti of kaydytRastit) {
		let apu = rasti.koodi[0];
		if ( parseInt(apu) ) {
			pisteet += parseInt(apu);
		}
	}
	return pisteet;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * @summary: Laskee joukkueen kulkeman matkan.
 * @param: {Array} joukkueen käymät rastit
 * @return: {Int} Lasketut pisteet
 */
function laskeMatka(kaydytRastit) {
	var matka = 0;
	var lat1 = 0.0, lon1 = 0.0, lat2 = 0.0, lon2 = 0.0;
	for (let rasti of kaydytRastit) {
		lat2 = rasti.lat;
		lon2 = rasti.lon;
		if ( lat1 && lon1 && lat2 && lon2 ) {	//ei lasketa jos joku koordinaateista on nolla
			matka += getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2);
		}
		lat1 = lat2;
		lon1 = lon2;
	}
	return matka;
}	

/**
 * @summary: Laskee joukkueen kilpailuun käyttämän ajan.
 * @param: {Array} kaydytRastit: joukkueen käymät rastit
 * @return: {String} Käytetty aika muodossa tunnit:minuutit:sekunnit
 */
function laskeAika(kaydytRastit){
	var maali = new Date();
	var lahto = new Date();
	if (kaydytRastit.length === 0){
		return "00:00:00";
	}
	maali = kaydytRastit[kaydytRastit.length-1].aika;
	lahto = kaydytRastit[0].aika;
	var tunnit = maali.getHours() - lahto.getHours();
	var minuutit = maali.getMinutes() - lahto.getMinutes();
	var sekunnit = maali.getSeconds() - lahto.getSeconds();
	if (minuutit < 0){
		tunnit--;
		minuutit += 60;
	}
	if (sekunnit < 0){
		minuutit--;
		sekunnit += 60;
	}
	tunnit.toFixed(0);
	minuutit.toFixed(0);
	sekunnit.toFixed(0);
	var tunnitStr = tunnit.toString();
	var minuutitStr = minuutit.toString();
	var sekunnitStr = sekunnit.toString();
	return tunnitStr.padStart(2, "0") + ":" + minuutitStr.padStart(2, "0") + ":" + sekunnitStr.padStart(2, "0");
	//return tunnit.toPrecision(2) + ":" + minuutit.toPrecision(2) + ":" + sekunnit.toPrecision(2);
}

/**
 * @summary: Objekti joka sisältää joukkueen tulokset.
 * @prop {string}	joukkue: Joukkueen nimi.
 * @prop {int}		pisteet: Joukkueen keräämät pisteet.
 * @prop {float)	matka: 	Matka minkä joukkue on kulkenut.
 * @prop {string}	aika: 	Joukkueen kisaan käyttämä aika
 *							muodossa tunnit:minuutit:sekunnit
 */
function Tulos(joukkue, pisteet, matka, aika){
	this.joukkue = joukkue.nimi;
	this.pisteet = pisteet.toFixed(0);
	this.matka = matka.toFixed(0);
	this.aika = aika;
}

/**
 * @summary: Laskee kaikille joukkueille tulokset ja järjestää joukkueet
 * 			 pisteiden mukaan laskevaan järjestykseen. Tämän jälkeen tu-
			 lostaa tulokset konsoliin.
 */
function laskeTulokset(){
	var tulokset = new Array();
	for (let sarja of data.sarjat){
		for (let joukkue of sarja.joukkueet){
			var kaydytRastit = etsiKaydytRastit(joukkue);
			var pisteet = laskePisteet(kaydytRastit);
			var matka = laskeMatka(kaydytRastit);
			var aika = laskeAika(kaydytRastit);
			var tulos = new Tulos(joukkue, pisteet, matka, aika);
			tulokset.push(tulos);
		}
	}
	tulokset.sort( function (a, b) {
		if (a.pisteet === b.pisteet){
			return a.aika - b.aika;
		}
		else return b.pisteet - a.pisteet;
	});
	for (let tulos of tulokset){
		console.log(tulos.joukkue + ", " + tulos.pisteet + " p, " +
		tulos.matka + " km, " + tulos.aika);
	}
}
	

muokkaaJoukkue(mallijoukkue,"4h");
poistaJoukkue("Vara 1");
poistaJoukkue("Vara 2");
poistaJoukkue("Vara 3");
poistaJoukkue("Vara 4");
poistaJoukkue("Vapaat");
tulostaJoukkueet(data);
tulostaRastit(data);

laskeTulokset();
//console.dir(data);
