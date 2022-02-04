// data-muuttuja on sama kuin viikkotehtävässä 1.
//

"use strict";

//Objectit

/**
 * @summary: Olio joka pitää sisällään käytyjen rastien olennaiset tiedot.
 *
 * @param {int} koodi: Rastin koodi
 * @param {float} lat: Rastin leveyspiirikoordinaatti
 * @param {float} lon: Rastin pituuspiirikoordinaatti
 * @param {Date} aika: Aika jona rastilla on käyty
 * 
 * @prop {int} koodi: Rastin koodi
 * @prop {float} lat: Rastin leveyspiirikoordinaatti
 * @prop {float} lon: Rastin pituuspiirikoordinaatti
 * @prop {Date} aika: Aika jona rastilla on käyty
 */
function KaytyRasti(koodi, lat, lon, aika) {
    this.koodi = koodi;
    this.lat = lat;
    this.lon = lon;
    this.aika = new Date(aika);
}

/**
 * @summary: Objekti joka sisältää joukkueen tulokset.
 * 
 * @param {Joukkue} joukkue: Joukkue jota tutkitaan
 * @param {Sarja} sarja: Sarja johon joukkue osallistui
 * @param {int} pisteet: Joukkueen keräämät pisteet
 * @param {float} matka: Joukkueen kulkema matka
 * @param {string} aika: Joukkueen kisa-aika
 * 
 * @prop {Joukkue} joukkue: Joukkue. Nimi löytyy joukkue.nimi, jäsenet joukkue.jasenet[]
 * @prop {string} sarja: Sarja missä joukkue kisaa
 * @prop {int} pisteet: Joukkueen keräämät pisteet
 * @prop {float} matka: Matka minkä joukkue on kulkenut
 * @prop {string} aika: Joukkueen kisaan käyttämä aika muodossa tunnit:minuutit:sekunnit
 */
function Tulos(joukkue, sarja, pisteet, matka, aika) {
    this.joukkue = joukkue;
    this.sarja = sarja.nimi;
    this.pisteet = pisteet.toFixed(0);
    this.matka = matka.toFixed(1);
    this.aika = aika;
}

//Globaalit muuttujat

var muokattavaJoukkue = null;

//Tulosten laskenta

/**
 * @description: Etsii rasti-objektin annetusta datasta käyttäen ID:tä.
 * @param {int} id: Rastin id-numero
 * @return {object} rasti, null jos ei löydy
 */
function etsiRasti(id) {
    var idInt = parseInt(id);
    for (let rasti of data.rastit) {
        if (idInt === parseInt(rasti.id)) {
            return rasti;
        }
    }
    return null;
}

/**
 * @summary: 		Listaa joukkueen kiertämät rastit.
 * @description:	Listaus on tehty käyttäen KaytyRasti objekteja, joissa on
					listattuna rastin koodi, positio ja aika milloin joukkue
					on rastilla käynyt.
 * @param {object} joukkue: Tutkittava joukkue
 * @return {Array}: joukkueen käymät KaytyRasti ajan mukaan järjestettynä
 */
function etsiKaydytRastit(joukkue) {
    var kaydytRastit = new Array();
    var rasti = null;
    for (let tupa of data.tupa) {
        if (joukkue.id === tupa.joukkue) {
            rasti = etsiRasti(tupa.rasti);
            if (rasti) {
                let kaytyRasti = new KaytyRasti(rasti.koodi, rasti.lat, rasti.lon, tupa.aika);
                if (!kaydytRastit.includes(kaytyRasti)) {
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
 * @description: Joukkue saa pisteitä rastin koodin ensimmäisen merkin
 *				 verran. Esim. jos koodi on 9A, siitä saa 9 pistettä. 					
 *				 Jos rastin koodin ensimmäinen merkki ei ole kokonais-
 *				 luku, rastista ei saa pisteitä.
 * @param {Set} kaydytRastit: joukkueen käymät rastit
 * @return {Int} Lasketut pisteet
 */
function laskePisteet(kaydytRastit) {
    var pisteet = 0;
    for (let rasti of kaydytRastit) {
        let apu = rasti.koodi[0];
        if (parseInt(apu)) {
            pisteet += parseInt(apu);
        }
    }
    return pisteet;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * @summary: Laskee joukkueen kulkeman matkan.
 * @param {Array} kaydytRastit: joukkueen käymät rastit
 * @return {Int}: Lasketut pisteet
 */
function laskeMatka(kaydytRastit) {
    var matka = 0;
    var lat1 = 0.0, lon1 = 0.0, lat2 = 0.0, lon2 = 0.0;
    for (let rasti of kaydytRastit) {
        lat2 = rasti.lat;
        lon2 = rasti.lon;
        if (lat1 && lon1 && lat2 && lon2) {	//ei lasketa jos joku koordinaateista on nolla
            matka += getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        }
        lat1 = lat2;
        lon1 = lon2;
    }
    return matka;
}

/**
 * @summary: Laskee joukkueen kilpailuun käyttämän ajan.
 * @param {Array} kaydytRastit: joukkueen käymät rastit
 * @return {String} Käytetty aika muodossa tunnit:minuutit:sekunnit
 */
function laskeAika(kaydytRastit) {
    var maali = new Date();
    var lahto = new Date();
    if (kaydytRastit.length === 0) {
        return "00:00:00";
    }
    maali = kaydytRastit[kaydytRastit.length - 1].aika;
    lahto = kaydytRastit[0].aika;
    var tunnit = maali.getHours() - lahto.getHours();
    var minuutit = maali.getMinutes() - lahto.getMinutes();
    var sekunnit = maali.getSeconds() - lahto.getSeconds();
    if (minuutit < 0) {
        tunnit--;
        minuutit += 60;
    }
    if (sekunnit < 0) {
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
 * @summary: Laskee kaikille joukkueille tulokset ja palauttaa tulostaulukon.
 * @return {Array}: Tulos-objektitaulukko
 */
function laskeTulokset() {
    var tulokset = new Array();
    for (let sarja of data.sarjat) {
        for (let joukkue of sarja.joukkueet) {
            var kaydytRastit = etsiKaydytRastit(joukkue);
            var pisteet = laskePisteet(kaydytRastit);
            var matka = laskeMatka(kaydytRastit);
            var aika = laskeAika(kaydytRastit);
            var tulos = new Tulos(joukkue, sarja, pisteet, matka, aika);
            tulokset.push(tulos);
        }
    }
    return tulokset;
}

//Järjestelyfunktiot

/**
 * @summary: Järjestely-funktio joka järjestää joukkueet sarjoittain pistejärjestykseen.
 *           Jos pisteet ovat samat, järjestetään käytetyn ajan mukaan ja jos aikakin on
 *           sama, laitetaan aakkosjärjestykseen.
 * @param {Tulos} a: Ensimmäinen alkio
 * @param {Tulos} b: Toinen alkio
 * @return {int}: A:n ja B:n välinen järjestys
 */
function jarjestaSarja(a, b) {
    var sarjaA = a.sarja.toUpperCase();
    var sarjaB = b.sarja.toUpperCase();
    if (sarjaA < sarjaB) {
        return -1;
    }
    if (sarjaA > sarjaB) {
        return 1;
    }
    return jarjestaPisteet(a, b);
}

/**
 * @summary: Järjestely-funktio joka järjestää joukkueet nimen alenevaan aakkosjärjestykseen.
 * @param {Tulos} a: Ensimmäinen alkio
 * @param {Tulos} b: Toinen alkio
 * @return {int}: A:n ja B:n välinen järjestys
 */
function jarjestaJoukkue(a, b) {
    var nimiA = a.joukkue.nimi.toUpperCase();
    var nimiB = b.joukkue.nimi.toUpperCase();
    if (nimiA < nimiB) {
        return -1;
    }
    if (nimiA > nimiB) {
        return 1;
    }
    return 0;
}

/**
 * @summary: Järjestely-funktio joka järjestää joukkueet pistejärjestykseen. Jos pisteet
 *           ovat samat, järjestetään käytetyn ajan mukaan.
 * @param {Tulos} a: Ensimmäinen alkio
 * @param {Tulos} b: Toinen alkio
 * @return {int}: A:n ja B:n välinen järjestys
 */
function jarjestaPisteet(a, b) {
    if (a.pisteet === b.pisteet) {
        return jarjestaAika(a, b);
    }
    else {
        return b.pisteet - a.pisteet;
    }
}

/**
 * @summary: Järjestely-funktio joka järjestää joukkueet matkan mukaan alenevaan järjestykseen.
 * @param {Tulos} a: Ensimmäinen alkio
 * @param {Tulos} b: Toinen alkio
 * @return {int}: A:n ja B:n välinen järjestys
 */
function jarjestaMatka(a, b) {
    return b.matka - a.matka;
}

/**
 * @summary: Järjestely-funktio joka järjestää joukkueet ajan mukaan alenevaan järjestykseen.
 * @param {Tulos} a: Ensimmäinen alkio
 * @param {Tulos} b: Toinen alkio
 * @return {int}: A:n ja B:n välinen järjestys
 */
function jarjestaAika(a, b) {
    var hA = parseInt(a.aika.substring(0, 2));
    var minA = parseInt(a.aika.substring(3, 5));
    var sA = parseInt(a.aika.substring(6, 8));
    var hB = parseInt(b.aika.substring(0, 2));
    var minB = parseInt(b.aika.substring(3, 5));
    var sB = parseInt(b.aika.substring(6, 8));
    if (hA !== hB) {
        return hB - hA; 
    }
    if (minA !== minB) {
        return minB - minA;
    }
    if (sA !== sB) {
        return sB - sA;
    }
    return 0;
}

//DOM-elementtien luomisfunktiot

/**
 * @summary: Luo tulostaulun sivulle.
 * @param {Tulos} tulokset: Taulukko joka sisältää kaikki Tulos-oliot.
 * @return {Element}: Tulostaulu elementti
 */
function luoTulostaulu(tulokset) {
    var table1 = document.createElement('table');

    //Taulukon otsake
    var caption1 = document.createElement('caption');
    table1.appendChild(caption1);
    var txt2 = document.createTextNode('Tulokset');
    caption1.appendChild(txt2);
    var tbody1 = document.createElement('tbody');
    table1.appendChild(tbody1);
    var tr1 = document.createElement('tr');
    tbody1.appendChild(tr1);

    //Sarakkeiden otsikot

    //Sarja
    var th1 = document.createElement('th');
    tr1.appendChild(th1);
    var txt4 = document.createTextNode('Sarja');

    var a2 = document.createElement('a');
    a2.setAttribute('href', '#tupa');
    th1.appendChild(a2);
    a2.addEventListener("click", jarjestaTuPa);
    a2.appendChild(txt4);
    
    //Joukkue
    var th2 = document.createElement('th');
    tr1.appendChild(th2);
    var txt5 = document.createTextNode('Joukkue');

    var a3 = document.createElement('a');
    a3.setAttribute('href', '#tupa');
    th2.appendChild(a3);
    a3.addEventListener("click", jarjestaTuPa);
    a3.appendChild(txt5);

    //Pisteet
    var th3 = document.createElement('th');
    tr1.appendChild(th3);
    var txt6 = document.createTextNode('Pisteet');

    var a4 = document.createElement('a');
    a4.setAttribute('href', '#tupa');
    th3.appendChild(a4);
    a4.addEventListener("click", jarjestaTuPa);
    a4.appendChild(txt6);

    //Matka
    var th4 = document.createElement('th');
    tr1.appendChild(th4);
    var txt7 = document.createTextNode('Matka');

    var a5 = document.createElement('a');
    a5.setAttribute('href', '#tupa');
    th4.appendChild(a5);
    a5.addEventListener("click", jarjestaTuPa);
    a5.appendChild(txt7);

    //Aika
    var th5 = document.createElement('th');
    tr1.appendChild(th5);
    var txt8 = document.createTextNode('Aika');

    var a6 = document.createElement('a');
    a6.setAttribute('href', '#tupa');
    th5.appendChild(a6);
    a6.addEventListener("click", jarjestaTuPa);
    a6.appendChild(txt8);

    //Joukkueen tulokset
    for (let tulos of tulokset) {
        var tr2 = document.createElement('tr');
        tbody1.appendChild(tr2);
        var td1 = document.createElement('td');
        tr2.appendChild(td1);

        //Sarja
        var txt9 = document.createTextNode(tulos.sarja);
        td1.appendChild(txt9);
        var td2 = document.createElement('td');
        tr2.appendChild(td2);

        //Joukkueen nimi
        var a1 = document.createElement('a');
        a1.setAttribute('href', '#joukkue');
        td2.appendChild(a1);
        var txt10 = document.createTextNode(tulos.joukkue.nimi);
        a1.addEventListener("click", haeJoukkueenTiedot);
        a1.appendChild(txt10);

        //Joukkueenjäsenet
        var br1 = document.createElement('br');
        td2.appendChild(br1);
        var jasenetS = tulos.joukkue.jasenet[0];
        for (var i = 1; i < tulos.joukkue.jasenet.length; i++) {
            jasenetS += ", " + tulos.joukkue.jasenet[i];
        }
        var txt11 = document.createTextNode(jasenetS);
        td2.appendChild(txt11);

        //Pisteet
        var td3 = document.createElement('td');
        tr2.appendChild(td3);
        var txt12 = document.createTextNode(tulos.pisteet);
        td3.appendChild(txt12);

        //Matka
        var td4 = document.createElement('td');
        tr2.appendChild(td4);
        var txt13 = document.createTextNode(tulos.matka);
        td4.appendChild(txt13);

        //Aika
        var td5 = document.createElement('td');
        tr2.appendChild(td5);
        var txt14 = document.createTextNode(tulos.aika);
        td5.appendChild(txt14);
    }   
    return table1;
}

function ce(tag, name) {
    var element;
    if (name && window.ActiveXObject) {
        element = document.createElement('<' + tag + ' name="' + name + '">');
    } else {
        element = document.createElement(tag);
        element.setAttribute('name', name);
    }
    return element;
}

/**
 * @summary: Luo sivulle kaavakkeen rastin lisäämistä varten.
 * @return {Element}: Kaavake
 */
function luoLisaaRastiForm() {
    var form1 = document.createElement('form');
    form1.setAttribute('action', 'foobar.ei.toimi.example');
    form1.setAttribute('method', 'post');
    form1.setAttribute("id", "lisaaRasti");
    var fieldset1 = document.createElement('fieldset');
    form1.appendChild(fieldset1);
    var legend1 = document.createElement('legend');
    fieldset1.appendChild(legend1);
    var txt3 = document.createTextNode('Rastin tiedot');
    legend1.appendChild(txt3);
    var p1 = document.createElement('p');
    fieldset1.appendChild(p1);
    var label1 = document.createElement('label');
    p1.appendChild(label1);
    var txt5 = document.createTextNode('Lat ');
    label1.appendChild(txt5);

    //latInput
    var latInput = document.createElement('input');
    latInput.setAttribute('type', 'text');
    latInput.setAttribute("id", "lat");
    label1.appendChild(latInput);

    var p2 = document.createElement('p');
    fieldset1.appendChild(p2);
    var label2 = document.createElement('label');
    p2.appendChild(label2);
    var txt7 = document.createTextNode('Lon ');
    label2.appendChild(txt7);

    //lonInput
    var lonInput = document.createElement('input');
    lonInput.setAttribute('type', 'text');
    lonInput.setAttribute("id", "lon");
    label2.appendChild(lonInput);

    var p3 = document.createElement('p');
    fieldset1.appendChild(p3);
    var label3 = document.createElement('label');
    p3.appendChild(label3);
    var txt9 = document.createTextNode('Koodi ');
    label3.appendChild(txt9);

    //koodiInput
    var koodiInput = document.createElement('input');
    koodiInput.setAttribute('type', 'text');
    koodiInput.setAttribute("id", "koodi");
    label3.appendChild(koodiInput);

    var p4 = document.createElement('p');
    fieldset1.appendChild(p4);

    //"Lisää rasti"-nappulan luonti
    var lisaaRastiButton = ce('button', 'rasti');
    lisaaRastiButton.setAttribute('id', 'rastiButton');
    p4.appendChild(lisaaRastiButton);
    var txt11 = document.createTextNode('Lisää rasti');
    lisaaRastiButton.appendChild(txt11);

    //listenerien luonti
    lisaaRastiButton.addEventListener("click", lisaaRasti);
    lisaaRastiButton.disabled = true;
    lonInput.addEventListener("input", tarkistaRastitForm);
    latInput.addEventListener("input", tarkistaRastitForm);
    koodiInput.addEventListener("input", tarkistaRastitForm);

    return form1;
}

/**
 * @summary: Luo kaavakkeen jolla voi lisätä uusia joukkueita kisaan.
 * @return {Element}: Kaavake
 */
function luoJoukkueForm() {
    var form1 = document.createElement('form');
    form1.setAttribute('action', 'foobar.ei.toimi.example');
    form1.setAttribute('method', 'post');

    //Joukkueiden lisäämistä varten kenttä, id: "joukkueField"
    var joukkueField = luoJoukkueField();
    form1.appendChild(joukkueField);

    //Jäsenten lisäämiseen tarkoitettu osio, id: "jasenetField"
    var jasenetField = luoJasenetField();
    joukkueField.appendChild(jasenetField);

    //Lisää Joukkue -nappi, id: "joukkueNappi"
    var joukkueNappi = luoLisaaJoukkueNappi();
    joukkueField.appendChild(joukkueNappi);

    //Joukkueen rastileimaukset
    var rastileimatField = luoLeimatField();
    joukkueField.appendChild(rastileimatField);

    return form1;
}

function luoLeimatField() {
    var leimatField = document.createElement('fieldset');
    leimatField.setAttribute("id", "leimatField");
    var legend1 = document.createElement('legend');
    leimatField.appendChild(legend1);
    var txt3 = document.createTextNode('Rastileimaukset');
    legend1.appendChild(txt3);

    var p1 = document.createElement('p');
    leimatField.appendChild(p1);
    var label1 = document.createElement('label');
    var txt1 = document.createTextNode('Koodi ');
    label1.appendChild(txt1);
    p1.appendChild(label1);

    //Select
    var select1 = luoLeimaSelect(koodi);
    label1.appendChild(select1);

    //Leimausaika
    var label2 = document.createElement('label');
    var txt2 = document.createTextNode('  Aika ');
    label2.appendChild(txt2);
    p1.appendChild(label2);

    var dateInput = document.createElement('input');
    dateInput.setAttribute('type', 'date');
    dateInput.addEventListener("change", tarkistaUusiLeimaField);
    label2.appendChild(dateInput);

    var aikaInput = document.createElement('input');
    aikaInput.setAttribute('type', 'time');
    aikaInput.setAttribute('step', '1');
    aikaInput.addEventListener("change", tarkistaUusiLeimaField);
    label2.appendChild(aikaInput);

    //Lisää-nappi
    var lisaaNappi = document.createElement('input');
    lisaaNappi.setAttribute('value', 'Lisää uusi');
    lisaaNappi.setAttribute('type', 'button');
    lisaaNappi.addEventListener("click", lisaaLeima);
    lisaaNappi.disabled = true;
    p1.appendChild(lisaaNappi);

    var leimalista = luoLeimaListaField();
    leimalista.hidden = "true";
    leimatField.appendChild(leimalista);

    return leimatField;
}

function luoJoukkueField() {
    var fieldset1 = document.createElement('fieldset');
    fieldset1.setAttribute("id", "joukkueField");
    var legend1 = document.createElement('legend');
    fieldset1.appendChild(legend1);    
    var txt3 = document.createTextNode('Uusi joukkue');
    legend1.appendChild(txt3);
    var p1 = document.createElement('p');
    fieldset1.appendChild(p1);
    var label1 = document.createElement('label');
    p1.appendChild(label1);
    var txt5 = document.createTextNode('Nimi ');
    label1.appendChild(txt5);

    //Joukkueen nimi
    var nimiInput = document.createElement('input');
    nimiInput.setAttribute('type', 'text');
    nimiInput.setAttribute("id", "nimiInput");
    label1.appendChild(nimiInput);
    nimiInput.addEventListener("input", tarkistaJoukkueetForm);

    return fieldset1;
}

function luoJasenetField() {
    var jasenetField = document.createElement('fieldset');
    jasenetField.setAttribute("id", "jasenetField");
    var legend2 = document.createElement('legend');
    jasenetField.appendChild(legend2);
    var txt8 = document.createTextNode('Jäsenet');
    legend2.appendChild(txt8);

    //...
    var txt13 = document.createTextNode('...\n        ');
    jasenetField.appendChild(txt13);

    return jasenetField;
}

function luoLisaaJoukkueNappi() {
    var p4 = document.createElement('p');
    var button1 = ce('button', 'joukkue');
    button1.setAttribute("id", "joukkueNappi");
    p4.appendChild(button1);
    var txt15 = document.createTextNode('Lisää joukkue');
    button1.appendChild(txt15);
    button1.disabled = true;
    button1.addEventListener("click", lisaaJoukkue);

    return p4;
}

function luoLeimaListaField() {
    var leimaListaField = document.createElement('fieldset');
    var legend1 = document.createElement('legend');
    leimaListaField.appendChild(legend1);
    var txt2 = document.createTextNode('Leimalistaus');
    legend1.appendChild(txt2);

    //Leimalista
    var table1 = document.createElement('table');
    leimaListaField.appendChild(table1);
    table1.setAttribute("id", "leimaTaulukko");
    var tbody1 = document.createElement('tbody');
    table1.appendChild(tbody1);
    var tr1 = document.createElement('tr');
    tbody1.appendChild(tr1);
    var th1 = document.createElement('th');
    tr1.appendChild(th1);
    var txt5 = document.createTextNode('Koodi');
    th1.appendChild(txt5);
    var th2 = document.createElement('th');
    tr1.appendChild(th2);
    var txt6 = document.createTextNode('Aika');
    th2.appendChild(txt6);

    //Tietorivi, tässä vain testaamista varten
    //var tr2 = luoLeimaRivi("66", "2018-08-03 11:30:45");
    //tbody1.appendChild(tr2);

    return leimaListaField;
}

/**
 * @summary: Luo uuden rasti
 * @param {string} koodi: Rastin koodi
 * @param {Date} aika: Leimausaika
 * @return {Element}: <tr> jossa tarvittava
 */
function luoLeimaRivi(koodi, aika) {
    var tr2 = document.createElement('tr');

    //Koodi-select
    var td1 = document.createElement('td');
    tr2.appendChild(td1);
    var select1 = luoLeimaSelect(koodi);
    td1.appendChild(select1);

    //Leimausaika
    var td2 = document.createElement('td');
    tr2.appendChild(td2);

    var year = aika.getFullYear() + "";
    var month = (aika.getMonth() + 1) + "";
    var day = aika.getDate() + "";
    var hour = aika.getHours() + "";
    var min = aika.getMinutes() + "";
    var sec = aika.getSeconds() + "";

    var dateString = year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
    var timeString = hour.padStart(2, "0") + ":" + min.padStart(2, "0") + ":" + sec.padStart(2, "0");

    var dateInput = document.createElement('input');
    dateInput.setAttribute('type', 'date');
    dateInput.value = dateString;
    td2.appendChild(dateInput);

    var aikaInput = document.createElement('input');
    aikaInput.setAttribute('type', 'time');
    aikaInput.setAttribute('step', '1');
    aikaInput.value = timeString;
    td2.appendChild(aikaInput);

    //Poista-nappi
    var td3 = document.createElement('td');
    tr2.appendChild(td3);
    var poistaNappi = document.createElement('input');
    poistaNappi.setAttribute('value', 'Poista');
    poistaNappi.setAttribute('type', 'button');
    poistaNappi.addEventListener("click", poistaLeimaRivi);
    td3.appendChild(poistaNappi);

    return tr2;
}

function luoLeimaSelect(selected) {
    var select = document.createElement('select');
    for (let rasti of data.rastit) {
        
        var option = document.createElement('option');
        var txt = document.createTextNode(rasti.koodi);
        option.appendChild(txt);
        if (rasti.koodi === selected) {
            option.setAttribute("selected", "selected");
        }
        select.appendChild(option);
    }
    return select;
}

/**
 * @summary: Luo uuden input-kentän Joukkue-lomakkeeseen
 * @param {int} i: Mikä tällä hetkellä viimeinen input-kenttä
 */
function luoJasenInput(i) {
    var p = document.createElement('p');
    var label = document.createElement('label');
    p.appendChild(label);
    var txt = document.createTextNode('Jäsen ' + (i+1) + " ");
    label.appendChild(txt);
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.addEventListener("input", tarkistaJoukkueetForm);
    label.appendChild(input);

    var jasenet = document.getElementById("jasenetField");
    jasenet.insertBefore(p, jasenet.lastChild);
}

/**
 * @summary: Poistaa viimeisen input-kentän Joukkue-lomakkeesta
 * @param {NodeList} inputs: Lomakkeen input-kentät
 * @return {NodeList}: Lomakkeen input-kentät
 */
function poistaJasenInput(inputs) {
    var jasenInputField = document.getElementById("jasenetField");
    jasenInputField.removeChild(jasenInputField.lastElementChild);
    return inputs;
}

/**
 * @summary: Poistaa Rastileimarivin kun on painettu kyseisellä rivillä olevaa Poista-nappia
 * @param {Event} e: Click-Event Poista-napista
 */
function poistaLeimaRivi(e) {
    var rivi = e.target.parentNode.parentNode;
    var tbody = rivi.parentNode;
    if (tbody.childElementCount < 3) {
        tbody.parentNode.parentNode.hidden = "true";
        rivi.parentNode.removeChild(rivi);
    } else {
        rivi.parentNode.removeChild(rivi);
    }
}

//Interaktiiviset elementit
/**
 * @summary: Enabloi "Lisää rasti"-napin kun lomakkeen kaikissa kohdissa on arvoja.
 * @param {event} e: Triggeröivä event.
 */
function tarkistaRastitForm(e) {
    e.preventDefault();
    var form = getParentForm(e.target);
    var inputit = form.getElementsByTagName("input");
    var laskin = 0;
    for (let input of inputit) {
        if (input.value !== "") {
            laskin++;
        }
    }
    var button = form.getElementsByTagName("button")[0];
    
    if (laskin === inputit.length) {
        button.disabled = false;
    } else {
        button.disabled = true;
    } 
}

/**
 * @summary: Tarkistaa, onko lisättävälle joukkueelle annettu nimi ja vähintään 2 jäsentä.
 *           Lisää tai poistaa jäsen-inputteja tarpeen mukaan.
 */
function tarkistaJoukkueetForm(e) {
    var nimiInput = document.getElementById("nimiInput");
    var inputs = document.getElementById("jasenetField").getElementsByTagName("input");
    var button = document.getElementById("joukkueNappi");

    //Tarkistetaan, tarvitseeko poistaa jasenInputteja, onko inputteja enemmän kuin 2
    //ja kaksi viimeistä inputtia ovat tyhjiä.
    if ((inputs.length > 2) && !inputs[inputs.length - 1].value && !inputs[inputs.length - 2].value) {
        inputs = poistaJasenInput(inputs);
    }

    if (nimiInput.value) {
        //Jos on nimi annettu, käydään kaikki jasenInputit läpi yksitellen
        for (let i = 0; i < inputs.length; i++) {
            //Jos löytyy tyhjä...
            if (inputs[i].value === "") {
                //...tarkistetaan onko tarvittavat, eli 2 jäsentä täytetty
                if (i < 2) {
                    button.disabled = true;
                    return;
                //ja jos on, niin onko löytynyt tyhjä viimeinen input
                } else if (i === inputs.length - 1) {
                    button.disabled = false;
                //ja jos se ei ole viimeinen, on jossain tyhjä input
                } else {
                    button.disabled = true;
                    return;
                }
            //Jos ei ole löytynyt yhtään tyhjää
            } else if (i === inputs.length - 1) {
                button.disabled = false;
                luoJasenInput(i+1);
            }
        }
    } else {
        button.disabled = true;
    }

}

/**
 * @summary: Laittaa "lisää uusi" -napin päälle jos on annettu aika oikein. 
 * @param {any} e: Laukaissut tapahtuma
 */
function tarkistaUusiLeimaField(e) {
    var date = e.target.parentNode.firstElementChild;
    var aika = date.nextSibling;
    var nappi = e.target.parentNode.parentNode.lastElementChild;
    if (date.value && aika.value) {
        nappi.disabled = false;
    } else {
        nappi.disabled = true;
    }
}

/**
 * @summary: Lisää uuden rastileiman joukkueen rastileimauslistaan jos annettu data
 *           on kelvollisessa muodossa.
 * @param {any} e: Lisää-napin painallus
 */
function lisaaLeima(e) {
    var koodiInput = e.target.parentNode.firstElementChild.firstElementChild;
    var dateInput = e.target.parentNode.firstElementChild.nextSibling.firstElementChild;
    var aikaInput = dateInput.nextSibling;
    var aika = new Date(dateInput.value + "T" + aikaInput.value);
    var rivi = luoLeimaRivi(koodiInput.value, aika);
    var leimaTaulukko = document.getElementById("leimaTaulukko");
    leimaTaulukko.firstElementChild.appendChild(rivi);
    leimaTaulukko.parentNode.hidden = false;
}

/**
 * @summary: Palauttaa Form-elementin joka on Noden laukaisijan esivanhempi 
 * @param {Node} target: Node jonka esivanhempaa etsitään
 * @return {Nodelist}: Noden esivanhempi Node
 */
function getParentForm(target) {
    var parentForm = target;
    while (parentForm.tagName !== "FORM" || parentForm.tagName === "BODY") {
        parentForm = parentForm.parentNode;
    }
    if (parentForm.tagName === "BODY") {
        console.log("ERROR: Input-kenttiä ei löytynyt!"); //Pitäisi tulostaa error.logiin, mutta en jaksa nyt opetella miten se toimii
        return;
    }
    return parentForm;
}

/**
 * @summary: Lisää Data-rakenteeseen uuden rastin lomakkeeseen annetuilla tiedoilla.
 * @param {event} e: Triggeröivä tapahtuma
 */
function lisaaRasti(e) {
    e.preventDefault();
    var lonP = parseFloat(document.getElementById("lon").value);
    var latP = parseFloat(document.getElementById("lat").value);
    var koodiP = document.getElementById("koodi").value;
    var rasti = {
        lon: lonP,
        lat: latP,
        koodi: koodiP
    };
    data.rastit.push(rasti);
    tulostaRastit();
}

/**
 * @summary: Tulostaa kisassa olevat rastit konsoliin.
 */
function tulostaRastit() {
    for (let rasti of data.rastit) {
        console.log("Lon:" + rasti.lon + ", Lat:" + rasti.lat + ", Koodi:" + rasti.koodi);
    }
}

/**
 * @summary: Lisää uuden joukkueen dataan tai muokkaa olemassa olevan joukkueen tietoja.
 * @param {Event} e: Lisää joukkue -napin painallus
 */
function lisaaJoukkue(e) {
    e.preventDefault();
    var uusiJoukkue = {
        "nimi": document.getElementById("nimiInput").value,
        "jasenet": lueTekstiInputit(document.getElementById("jasenetField").getElementsByTagName("input")),
        "id": luoId()
    };
    if (muokattavaJoukkue === null) {
        data.sarjat[1].joukkueet.push(uusiJoukkue);
    } else {
        uusiJoukkue.id = muokattavaJoukkue.id;
        muokattavaJoukkue.nimi = uusiJoukkue.nimi;
        muokattavaJoukkue.jasenet = uusiJoukkue.jasenet;
    }
    paivitaLeimat(uusiJoukkue.id);

    muokattavaJoukkue = null;
    resetoiJoukkueForm();
    paivitaTulostaulu("Sarja");
}

/**
 * @summary: Päivittää datan tupa-osion joukkueen muokatuilla rastileimauksilla
 * @param {int} id: Muokattavan joukkueen id
 */
function paivitaLeimat(id) {
    //Poistetaan kaikki joukkueen aiemmat leimaukset
    for (let i = 0; i < data.tupa.length; i++) {
        if (data.tupa[i].joukkue === id) {
            data.tupa.splice(i, 1);
        }
    }
    //Lisätään listauksesta uudet leimaukset
    var leimaTaulukko = document.getElementById("leimaTaulukko");
    var rivit = leimaTaulukko.getElementsByTagName("tr");
    for (let i = 1; i < rivit.length; i++) {
        var koodi = rivit[i].querySelector('select').value;
        var date = rivit[i].querySelector('input[type="date"]').value;
        var time = rivit[i].querySelector('input[type="time"]').value;

        var aika = date + " " + time;
        for (let i of data.rastit) {
            if (i.koodi === koodi) {
                var rasti = i.id;
                break;
            }
        }
        var leimaus = {
            "aika": aika,
            "rasti": rasti,
            "joukkue": id
        };
        data.tupa.push(leimaus);
    }
}

/**
 * @summary: Lukee annetuista teksti-syötteistä tiedot ja palauttaa ne taulukkona
 * @param {NodeList} inputs: teksti-syötteet node-listinä
 * @returns {Array}: Tekstisyötteiden sisältö taulukkona
 */
function lueTekstiInputit(inputs) {
    var jasenet = new Array();
    for (let input of inputs) {
        if (input.value) {
            jasenet.push(input.value);
        }
    }
    return jasenet;
}

/**
 * @summary: Luo joukkueelle 16 numeroisen ID:n jota ei löydy vielä datasta.
 * @returns: Uniikki 16-numeroinen id
 */
function luoId() {
    do {
        var id = Math.floor(Math.random() * Math.floor(10000000000000000));
        var duplicate = false;
        for (let sarja of data.sarjat) {
            for (let i of sarja.joukkueet) {
                if (id === i.id) {
                    duplicate = true;
                }
            }
        }
    } while (duplicate);
    return id;
}

/**
 * @summary: Luo uudestaan Joukkue-formin
 */
function resetoiJoukkueForm() {
    muokattavaJoukkue = null;
    var forms = document.getElementsByTagName("form");
    forms[0].parentNode.replaceChild(luoJoukkueForm(), forms[1]);
    luoJasenInput(0);
    luoJasenInput(1);
}

/**
 * @summary: Hakee valitun joukkueen tiedot ja täyttää ne Joukkue-kaavakkeeseen
 * @param {Event} e: Click-event valitun joukkueen nimen päällä.
 */
function haeJoukkueenTiedot(e) {
    resetoiJoukkueForm();
    var joukkueenNimi = e.target.textContent;
    var nimiInput = document.getElementById("nimiInput");
    var jasenInputs = document.getElementById("jasenetField").getElementsByTagName("input");
    var joukkueNappi = document.getElementById("joukkueNappi");

    //Hakee klikatun joukkueen datasta ja tallentaa sen globaaliin muuttujaan
    for (let sarja of data.sarjat) {
        for (let joukkue of sarja.joukkueet) {
            if (joukkue.nimi === joukkueenNimi) {
                muokattavaJoukkue = joukkue;
                break;
            }
        }
    }

    //Täyttää joukkueen nimi- ja jasen-inputit
    nimiInput.value = muokattavaJoukkue.nimi;
    for (var i = 0; i < muokattavaJoukkue.jasenet.length; i++) {
        if (!(i < jasenInputs.length)) {
            luoJasenInput(i);
        }
        jasenInputs[i].value = muokattavaJoukkue.jasenet[i];
    }

    //Täyttää rastileimat
    var leimaTaulukko = document.getElementById("leimaTaulukko");
    leimaTaulukko.parentNode.hidden = false;    
    var kaydytRastit = etsiKaydytRastit(muokattavaJoukkue);
    for (let rasti of kaydytRastit) {
        var rivi = luoLeimaRivi(rasti.koodi, rasti.aika);
        leimaTaulukko.firstElementChild.appendChild(rivi);
    }

    tarkistaJoukkueetForm();
    document.getElementById("jasenetField").parentNode.firstElementChild.textContent = "Muokkaa Joukkuetta";
    joukkueNappi.textContent = "Muokkaa joukkuetta";
}

/**
 * @summary: Järjestää tulostaulukon halutulla tavalla.
 * @param {string} jarjesta: Haluttu muoto string-muodossa
 */
function paivitaTulostaulu(jarjesta) {
    var tulokset = laskeTulokset();
    switch (jarjesta) {
        case "Sarja":
            tulokset.sort(jarjestaSarja);
            break;
        case "Joukkue":
            tulokset.sort(jarjestaJoukkue);
            break;
        case "Pisteet":
            tulokset.sort(jarjestaPisteet);
            break;
        case "Matka":
            tulokset.sort(jarjestaMatka);
            break;
        case "Aika":
            tulokset.sort(jarjestaAika);
            break;
        default:
            tulokset.sort(jarjestaSarja);
            break;
    }
    var tupa = document.getElementById("tupa");
    tupa.replaceChild(luoTulostaulu(tulokset), tupa.firstElementChild);
}

/**
 * @summary: EventListener joka lukee minkä perusteella tulostaulu halutaan järjestää
 * @param {Event} e: Click-event
 */
function jarjestaTuPa(e){
    paivitaTulostaulu(e.target.textContent);
}

window.onload = function () {
    //Lasketaan kisan tulokset ja järjestetään ne pisteiden mukaan järjestykseen
    var tulokset = laskeTulokset();
    tulokset.sort(jarjestaSarja);

    //Luodaan tulostaulu ja rastien ja joukkueiden lisäämis kaavakkeet
    var forms = document.getElementsByTagName("form");
    forms[0].parentNode.replaceChild(luoLisaaRastiForm(), forms[0]);
    forms[0].parentNode.replaceChild(luoJoukkueForm(), forms[1]);
    //Luodaan jasenInputit tyhjään JoukkueFormiin
    luoJasenInput(0);
    luoJasenInput(1);
    //Tulospalvelu on luotava viimeisenä, sillä siinä haetaan Joukkueformista tavaraa
    document.getElementById("tupa").appendChild(luoTulostaulu(tulokset));
};