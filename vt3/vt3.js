// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

var muokattavaJoukkue = null;

window.onload = function () {
    document.querySelector('input[name="nimi"]').addEventListener("input", validateJoukkueNimi);

    var leimaustapaBoxit = document.querySelectorAll('input[type="checkbox"]');
    for (let box of leimaustapaBoxit) {
        box.addEventListener("change", validateLeimaustapa);
        box.setCustomValidity("Valitse vähintään yksi leimaustapa.");
    }

    luoKilpailuSelect();
    document.getElementById("kilpailu").addEventListener("change", paivitaSarjaRadio);

    for (var i = 0; i < 5; i++) {
        luoJasenInput(i);
    }

    paivitaKoodiDatalist();
    luoLeimarivi();

    var forms = document.querySelectorAll('form');
    forms[0].addEventListener("submit", tallennaJoukkue);
    forms[1].addEventListener("submit", lisaaKisa);

    document.querySelector('input[name="kilpailu"]').addEventListener("input", validateKisaNimi);
    document.querySelector('input[name="loppuaika"]').addEventListener("change", validateKisaAjat);
    document.querySelector('input[name="alkuaika"]').addEventListener("change", validateKisaAjat);
    document.querySelector('input[name="kesto"]').addEventListener("input", validateKisaAjat);

    var joukkueLista = luoJoukkueLista();
    var htmlBody = document.querySelector("body");
    htmlBody.insertBefore(joukkueLista, htmlBody.firstChild);
};

/*
 * ###################################
 * # Tietokantaa muokkaavat funktiot #
 * ###################################
 */

/**
 * @summary: Lisää tietorakenteeseen uuden joukkueen lomakkeeseen täytetyillä tiedoilla.
 * @param {Event} e: Lomakkeen submit-event. Target on oltava joukkue-lomake.
 */
function tallennaJoukkue(e) {
    e.preventDefault();
    var form = e.target;
    if (form.reportValidity()) {
        var nimi = form.querySelector('input[name="nimi"]').value.trim();
        var aika = form.querySelector('input[name="luontiaika"]').value;
        var leimaukset = form.querySelectorAll('input[type="checkbox"]');
        var sarjat = form.querySelectorAll('input[type="radio"]');
        var jasenInputs = document.getElementById("jasenetField").getElementsByTagName("input");

        var joukkue = {
            "nimi": nimi,
            "jasenet": haeTaytetyt(jasenInputs),
            "sarja": parseInt(haeValinnat(sarjat)[0]),
            "seura": null,
            "id": luoID(),
            "leimaustapa": haeValinnat(leimaukset),
            "luontiaika": aikaISOMuotoon(aika, " "),
            "rastit": haeLeimat()
        };
        if (muokattavaJoukkue === null) {
            data.joukkueet.push(joukkue);
        } else {
            joukkue.seura = muokattavaJoukkue.seura;
            joukkue.id = muokattavaJoukkue.id;
            data.joukkueet.splice(data.joukkueet.indexOf(muokattavaJoukkue), 1, joukkue);
            muokattavaJoukkue = null;
        }
        var vanhalista = document.getElementById("joukkuelista");
        vanhalista.parentNode.replaceChild(luoJoukkueLista(), vanhalista);
        tyhjennaLeimalista();
        luoLeimarivi();
        form.reset();
    }
}

/**
 * @summary: Täyttää Lisää joukkue -lomakkeen halutun joukkueen tiedoilla
 * @param {Event} e: Kutsuvan tapahtuman target.textContentissa on luettava halutun joukkueen nimi.
 */
function haeJoukkueenTiedot(e) {
    e.preventDefault();

    //Haetaan muokattava joukkue käyttäen e.targetttia.
    var nimi = e.target.textContent.trim();
    for (let joukkue of data.joukkueet) {
        if (joukkue.nimi.trim() === nimi) {
            muokattavaJoukkue = joukkue;
            break;
        }
    }

    //Täytetään lomakkeen tiedot joukkueen tiedoilla 
    var form = document.getElementById("joukkueForm");
    var inputs = form.querySelectorAll('input');
    
    //Nimi ja luontiaika
    inputs[0].value = muokattavaJoukkue.nimi.trim();
    inputs[1].value = aikaISOMuotoon(muokattavaJoukkue.luontiaika, "T");

    //Leimaustapa
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    for (let leimaustapa of muokattavaJoukkue.leimaustapa) {
        for (let box of checkboxes) {
            if (leimaustapa === box.value) {
                box.checked = true;
            }
        }
    }
    validateLeimaustapa();

    //Sarja
    var radios = form.querySelectorAll('input[type="radio"]');
    for (let radio of radios) {
        if (parseInt(radio.value) === parseInt(muokattavaJoukkue.sarja)) {
            radio.checked = true;
        }
    }

    //Jäsenet
    var jasenInputs = document.getElementById("jasenetField").querySelectorAll('input');
    for (let i = 0; i < muokattavaJoukkue.jasenet.length; i++) {
        if (i === jasenInputs.length) {
            luoJasenInput(i-1);
        }
        jasenInputs[i].value = muokattavaJoukkue.jasenet[i];
    }
    validateJasenet();

    //Rastileimaukset
    tyhjennaLeimalista();
    for (let leima of muokattavaJoukkue.rastit) {
        luoLeimarivi(leima);
    }
    luoLeimarivi();
    paivitaKoodiDatalist();
}


/**
 * @summary: Lisää tietorakenteeseen uuden kilpailun lomakkeeseen täytetyillä tiedoilla.
 * @param {Event} e: Lomakkeen submit-event
 */
function lisaaKisa(e) {
    e.preventDefault();
    var form = e.target;
    if (form.reportValidity()) {

        var kisa = {
            "nimi": form.querySelector('input[name="kilpailu"]').value.trim(),
            "id": luoID(),
            "loppuaika": document.querySelector('input[name="loppuaika"]').value,
            "alkuaika": document.querySelector('input[name="alkuaika"]').value,
            "kesto": parseInt(document.querySelector('input[name="kesto"]').value),
            "sarjat": data.kisat[0].sarjat.slice()
        };
        
        console.log(kisa);
        data.kisat.push(kisa);
        console.log("Kilpailu lisätty tietokantaan");
        /*
        var vanhalista = document.getElementById("joukkuelista");
        vanhalista.parentNode.replaceChild(luoJoukkueLista(), vanhalista);
        */
        console.log(data);

        luoKilpailuSelect();
        form.reset();
    }
}


/*
 * ##################
 * # Apu-funktioita #
 * ##################
 */

/**
 * @summary: Tyhjentää leimalistauksen inputeista. Muista luoda uusia inputteja tämän jälkeen.
 */
function tyhjennaLeimalista() {
    var tbody = document.getElementById("leimataulukko").firstElementChild;
    while (tbody.lastElementChild !== tbody.firstElementChild) {
        tbody.removeChild(tbody.lastElementChild);
    }
}

/**
 * @summary: Lukee joukkueen rastileimaukset annetuista arvoista ja palauttaa ne taulukkona.
 * @returns {Array}: Taulukko leimauksista
 */
function haeLeimat() {
    var leimat = new Array();
    var rivit = document.querySelectorAll('.leimarivi');
    for (let rivi of rivit) {
        if (!rivi.lastElementChild.firstElementChild.checked) {
            var koodi = haeRastiId(rivi.firstElementChild.firstElementChild.value);
            var aika = aikaISOMuotoon(rivi.firstElementChild.nextElementSibling.firstElementChild.value, " ");
            leimat.push({
                "aika": aika,
                "id": koodi
            });
        }
    }
    return leimat;
}

/**
 * @summary: Muuttaa annetun ajan ensin stringistä Date-olioksi, jonka jälkeen takaisin
 *           lokaalin ajan mukaiseksi ISO-stringiksi.
 * @param {string} aikaString: Muutettava aika ISO-stringinä
 * @param {string} valimerkki: Päiväyksen ja ajan väliin laitettava merkki
 * @returns {string}: Aika muutettuna ISO-stringiksi, välissä annettu välimerkki.
 */
function aikaISOMuotoon(aikaString, valimerkki) {
    var aika = new Date(aikaString);

    var year = aika.getFullYear() + "";
    var month = aika.getMonth() + 1 + "";
    var day = aika.getDate() + "";
    var hour = aika.getHours() + "";
    var min = aika.getMinutes() + "";
    var sec = aika.getSeconds() + "";

    var dateString = year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
    var timeString = hour.padStart(2, "0") + ":" + min.padStart(2, "0") + ":" + sec.padStart(2, "0");
    return dateString + valimerkki + timeString;
}

/**
 * @summary: Luo uniikin ID-numeron.
 * @returns {int}: Uniikki 16-numeroinen ID-numero jota ei löydy tietokannasta
 */
function luoID() {
    do {
        var id = Math.floor(Math.random() * Math.floor(10000000000000000));
        var unique = false;
        unique = onUniikkiID(id, data.kisat);
        for (let kisa of data.kisat) {
            unique = onUniikkiID(id, kisa.sarjat);
        }
        unique = onUniikkiID(id, data.rastit);
        unique = onUniikkiID(id, data.joukkueet);
    } while (!unique);
    return id;
}

/**
 * @summary: Tarkistaa, että annettua ID:tä ei löydy annetusta datasta.
 * @param {int} id: 16-numeroinen tarkastettava ID-numero
 * @param {JSON} iterable: Iteroitavaa JSON-dataa joka tarkistetaan.
 * @return {boolean}: Tosi jos ID on uniikki, epätosi jos löytyy sama ID-numero
 */
function onUniikkiID(id, iterable) {
    for (let i of iterable) {
        if (id === i.id) {
            return false;
        }
    }
    return true;
}

/**
 * @summary: Lisää valittujen checkboxien arvot taulukkoon ja palauttaa taulukon.
 * @param {NodeList} checkboxes: Läpikäytävät checkboxit
 * @returns {Array}: Valittujen checkboxien arvot
 */
function haeValinnat(checkboxes) {
    var valinnat = new Array;
    for (let i of checkboxes) {
        if (i.checked) {
            valinnat.push(i.value);
        }
    }
    return valinnat;
}

/**
 * @summary: Lisää annettujen inputtien täytettyjen kenttien arvot palautettavaan taulukkoon.
 * @param {NodeList} inputs: Lista teksti-inputeista
 * @return {Array}: Teksti-kenttien epätyhjät arvot
 */
function haeTaytetyt(inputs) {
    var jasenet = new Array;
    for (let i of inputs) {
        if (i.value) {
            jasenet.push(i.value);
        }
    }
    return jasenet;
}

/**
 * @param {int} id: Rastin ID-numero
 * @returns {string}: Rastin koodi stringinä
 */
function haeRastiKoodi(id) {
    for (let rasti of data.rastit) {
        if (id === rasti.id) {
            return rasti.koodi;
        }
    }
}

/**
 * @param {string} koodi: Rastin koodi stringinä
 * @returns {int}: Rastin ID-numero
 */
function haeRastiId(koodi) {
    for (let rasti of data.rastit) {
        if (koodi === rasti.koodi) {
            return rasti.id;
        }
    }
}

/*
 * ##################################
 * # DOM-Elementtien luomisfunktiot #
 * ##################################
 */

/**
 * @summary: Luo kilpailun sarjoista radiobuttonit.
 * @param {Event} e: Tapahtuman target.value on oltava kilpailun id-numero
 */
function paivitaSarjaRadio(e) {
    luoSarjaRadio(e.target.value);
}

/**
 * @summary: Luo Sarja-radiobuttonit käyttäen annetun kisan sarjoja.
 * @param {string} kisaID: Kisan ID-numero
 */
function luoSarjaRadio(kisaID) {
    var span = document.getElementById("sarja").firstElementChild;
    for (let kisa of data.kisat) {
        if (kisa.id === parseInt(kisaID)) {
            var sarjat = kisa.sarjat;
        }
    }
    var radiot = new Array();

    for (var i = 0; i < sarjat.length; i++) {
        var label = document.createElement('label');
        var txt = document.createTextNode(sarjat[i].nimi);
        var input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('value', sarjat[i].id);
        input.setAttribute('name', "sarja");

        label.appendChild(txt);
        label.appendChild(input);
        radiot.push(label);
    }
    radiot.sort(function (a, b) {
        return parseInt(a.textContent) - parseInt(b.textContent);
    });
    radiot[0].lastChild.checked = true;

    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    for (let i of radiot){
        span.appendChild(i);
    }
}

/**
 * @summary: Luo jäsen-inputin Jäsenet kohtaan.
 * @param {int} i: Montako jäsentä listassa on ennen lisäystä
 */
function luoJasenInput(i) {
    var jasenetField = document.getElementById("jasenetField");

    var label = document.createElement('label');
    var labelText = document.createTextNode("Jäsen " + (i + 1) + " ");

    var input = document.createElement("input");
    input.setAttribute('name', 'jasen' + (i + 1));
    input.setAttribute('type', 'text');
    input.setAttribute('size', '30');
    input.setCustomValidity("Jäseniä on oltava vähintään kaksi.");
    input.addEventListener("input", validateJasenet);

    label.appendChild(labelText);
    label.appendChild(input);

    jasenetField.appendChild(label);
}

/**
 * @summary: Luo DOM-elementtinä <ul></ul>-järjestämättömän listan joukkueista
 * @return {HTMLDivElement}: Lista kaikista joukkueista <div>-elementin sisällä.
 */
function luoJoukkueLista() {
    var div = document.createElement('div');
    div.setAttribute("id", "joukkuelista");

    var h2 = document.createElement("h2");
    var txt1 = document.createTextNode("Joukkuelistaus");
    h2.appendChild(txt1);
    div.appendChild(h2);

    var ul1 = document.createElement('ul');
    
    for (let i of data.joukkueet) {
        var li1 = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', '');
        a.addEventListener("click", haeJoukkueenTiedot);
        var txt2 = document.createTextNode(i.nimi);
        a.appendChild(txt2);
        li1.appendChild(a);
        ul1.appendChild(li1);        
    }
    div.appendChild(ul1);
    return div;
}

/**
 * @summary: Päivittää Kilpailu-alasvetovalikon vastaamaan nykyistä tietokantaa.
 */
function luoKilpailuSelect() {
    var select = document.getElementById("kilpailu");
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    for (var i = 0; i < data.kisat.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('value', data.kisat[i].id);
        if (i === 0) {
            option.setAttribute('selected', 'selected');
        }        
        var txt = document.createTextNode(data.kisat[i].nimi);
        option.appendChild(txt);
        select.appendChild(option);
    }
    luoSarjaRadio(select.value);
}

/**
 * @summary: Tarkistaa onko leimataulukon viimeiselle riville annettu arvoja.
 *           Jos on poistaa sen inputeista listenerit ja luo uuden tyhjän rivin.
 */
function luoUusiLeimarivi() {
    var rivi = document.getElementById("leimataulukko").firstElementChild.lastElementChild;
    var koodi = rivi.firstElementChild.firstElementChild;
    var aika = rivi.firstElementChild.nextElementSibling.firstElementChild;
    if (koodi.value && aika.value) {
        koodi.removeEventListener("blur", luoUusiLeimarivi);
        aika.removeEventListener("blur", luoUusiLeimarivi);
        luoLeimarivi();
    }
}

/**
 * @summary: Luo uuden rastileiman.
 * @param {Array} leima: Leima-objekti, voi olla tyhjä tai sisältää koodin ja leimausajan.
 */
function luoLeimarivi(leima) {
    var tbody1 = document.getElementById("leimataulukko").firstElementChild;

    var tr1 = document.createElement('tr');
    tr1.setAttribute("class", "leimarivi");
    tbody1.appendChild(tr1);

    var td1 = document.createElement('td');  
    var koodiInput = document.createElement('input');
    koodiInput.setAttribute('type', 'text');
    koodiInput.setAttribute('list', 'rastikoodit');
    koodiInput.setAttribute('size', '2');
    koodiInput.addEventListener("input", validateLeimaKoodi);
    if (leima) {
        koodiInput.value = haeRastiKoodi(parseInt(leima.id));
    } else {
        koodiInput.addEventListener("blur", luoUusiLeimarivi);
    }
    td1.appendChild(koodiInput);    
    tr1.appendChild(td1);

    var td2 = document.createElement('td');    
    var aikaInput = document.createElement('input');
    aikaInput.setAttribute('type', 'datetime-local');
    aikaInput.setAttribute('step', '1');
    aikaInput.addEventListener("input", validateLeimaAika);
    if (leima) {
        aikaInput.value = aikaISOMuotoon(leima.aika, "T");
    } else {
        aikaInput.addEventListener("blur", luoUusiLeimarivi);
    }
    td2.appendChild(aikaInput);
    tr1.appendChild(td2);

    var td3 = document.createElement('td');    
    var input3 = document.createElement('input');
    input3.setAttribute('type', 'checkbox');
    td3.appendChild(input3);
    tr1.appendChild(td3);
}

/**
 * @summary: Päivittää rastileimaus-datalistan valideilla rastikoodeilla.
 */
function paivitaKoodiDatalist() {
    var datalist1 = document.createElement('datalist');
    datalist1.setAttribute('id', 'rastikoodit');
    var inputs = document.querySelectorAll('input[list="rastikoodit"]');
    var kaydytRastit = new Set();
    for (let i of inputs) {
        kaydytRastit.add(i.value);
    }
    for (let rasti of data.rastit) {
        if (!kaydytRastit.has(rasti.koodi)) {
            var option1 = document.createElement('option');
            option1.setAttribute("value", rasti.koodi);
            datalist1.appendChild(option1);
        }
    }    
    var field = document.getElementById("leimaukset");
    field.replaceChild(datalist1, field.firstElementChild);
}

/*
 * #######################
 * # Validointi-funktiot #
 * #######################
 */

/**
 * @summary: Tarkistaa, että nimi on uniikki annetussa datassa.
 * @param {Element} element: Validoitava HTML-elementti jonka .value oltava tarkistettava nimi.
 * @param {Iterable} iterable: Läpikäytävä data
 * @param {string} message: Validointi-viestiksi annettava tekstijono
 */
function validateNimi(element, iterable, message) {
    for (let i of iterable) {
        if (i.nimi.trim() === element.value.trim()) {
            element.setCustomValidity(message);
            return;
        }
    }
    element.setCustomValidity("");
}

/**
 * @summary: Tarkistaa, että annettu joukkueen nimi on uniikki
 * @param {Event} e: Event jonka target.value oltava joukkueen nimi
 */
function validateJoukkueNimi(e) {
    if (muokattavaJoukkue) {
        if (muokattavaJoukkue.nimi.trim() === e.target.value.trim()) {
            e.target.setCustomValidity("");
        }
    }
    validateNimi(e.target, data.joukkueet, "Syötetty joukkue on jo tietokannassa, anna eri nimi.");
}

/**
 * @summary: Tarkistaa, että annettu kisan nimi on uniikki
 * @param {Event} e: Event jonka target.value oltava joukkueen nimi
 */
function validateKisaNimi(e) {
    validateNimi(e.target, data.kisat, "Tämän niminen kilpailu on jo käyty, keksi uusi nimi.");
}

/**
 * @summary: Tarkistaa onko valittu vähintään yksi leimaustapa.
 */
function validateLeimaustapa() {
    var count = 0;
    var leimaustapaBoxit = document.querySelectorAll('input[type="checkbox"]');
    for (let i of leimaustapaBoxit) {
        if (i.checked) {
            count++;
        }
    }
    if (count > 0) {
        for (let i of leimaustapaBoxit) {
            i.setCustomValidity("");
        }
    } else {
        for (let i of leimaustapaBoxit) {
            i.setCustomValidity("Valitse vähintään yksi leimaustapa.");
        }
    }
}

/**
 * @summary: Tarkistaa onko jäsenten nimet lisätty oikein.
 * @description: 1. Tarkistaa onko jäseniä lisätty vähintään kaksi, ja jos on, poistaa
 *               virheilmoituksen. Muuten tekee virheilmoituksen uudestaan.
 *               2. Tarkistaa onko kaikki input kentät täynnä ja luo uusia jos on.
 *               3. Jos viimeiset kaksi inputtia on tyhjiä, poistaa viimeisen, kunhan
 *               poisto ei vähennä input-kenttien määrää liikaa.
 */
function validateJasenet() {
    var inputs = document.getElementById("jasenetField").getElementsByTagName("input");

    //Lasketaan täytetyt inputit
    var count = 0;
    for (let input of inputs) {
        if (input.value) {
            count++;
        }
    }

    //Tarkistetaan että vähintään 2 inputtia on tehty.
    if (count < 2) {
        for (let input of inputs) {
            input.setCustomValidity("Jäseniä on oltava vähintään kaksi.");
        }
    } else {
        for (let input of inputs) {
            input.setCustomValidity("");
        }
    }

    //Tarkistetaan onko kaikki input-kentät täynnä ja luodaan uusi jos on
    if (inputs.length === count) {
        luoJasenInput(inputs.length);
    }

    //Tarkistetaan, voiko inputtien määrää vähentää ja vähennetään jos voi
    var vika = inputs[inputs.length - 1].value;
    var tokavika = inputs[inputs.length - 2].value;
    if (!vika && !tokavika && inputs.length > 5) {
        var jasenetField = document.getElementById("jasenetField");
        jasenetField.removeChild(jasenetField.lastElementChild);
    }
}

/**
 * @summary: Tarkistaa, että kisan kesto, loppu- ja alkuaika on annettu oikein.
 */
function validateKisaAjat() {
    var loppuInput = document.querySelector('input[name="loppuaika"]');
    var loppu = new Date(loppuInput.value);
    var alku = new Date(document.querySelector('input[name="alkuaika"]').value);
    var kesto = document.querySelector('input[name="kesto"]').value;

    if (alku.getTime() > loppu.getTime()) {
        loppuInput.setCustomValidity("Kilpailu ei voi loppua ennen kuin se alkaa");
        //                                   s    m    h
    } else if (loppu.getTime() < kesto * 1000 * 60 * 60 + alku.getTime()) {
        loppuInput.setCustomValidity("Kilpailuaika on liian lyhyt suunnitellulla kestolla");
    } else {
        loppuInput.setCustomValidity("");
    }

}

/**
 * @summary: Tarkistaa, että on annettu vain olemassa olevia rastikoodeja
 * @param {Event} e: e.target.value on annettu koodi
 */
function validateLeimaKoodi(e) {
    for (let rasti of data.rastit) {
        if (e.target.value === rasti.koodi) {
            e.target.setCustomValidity("");
            return;
        }
    }
    e.target.setCustomValidity("Anna olemassaoleva rastikoodi.");
}

/**
 * @summary: Tarkastaa, että rastileimaus on tehty kisan aikana.
 * @param {Event} e: e.target.value on rastileimausaika.
 */
function validateLeimaAika(e) {
    var leimaAika = Date.parse(e.target.value);
    var radiot = document.querySelectorAll('input[name="sarja"]');
    for (let i of radiot) {
        if (i.checked) { var sarjaID = parseInt(i.value); }
    }
    var aloitusAika;
    var lopetusAika;
    var kilpailuID = parseInt(document.getElementById("kilpailu").value);
    for (let kisa of data.kisat) {
        if (parseInt(kisa.id) === kilpailuID) {
            for (let sarja of kisa.sarjat) {
                if (parseInt(sarja.id) === sarjaID) {
                    if (sarja.alkuaika) {
                        aloitusAika = Date.parse(sarja.alkuaika);
                    } else {
                        aloitusAika = Date.parse(kisa.alkuaika);
                    }
                    if (sarja.loppuaika) {
                        lopetusAika = Date.parse(sarja.loppuaika);
                    } else {
                        lopetusAika = Date.parse(kisa.loppuaika);
                    }
                }
            }
        }
    }
    if (leimaAika > lopetusAika) {
        e.target.setCustomValidity("Rasti ei voi olla leimattu kilpailun päätyttyä.");
        return;
    }
    if (leimaAika < aloitusAika) {
        e.target.setCustomValidity("Rasti ei voi olla leimattu ennen kilpailun alkamista.");
        return;
    }
    e.target.setCustomValidity("");
}