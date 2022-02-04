"use strict";

function numeroi() {
    var h2Lista = document.getElementsByTagName("h2");
    /*var firstChild = h2Lista.item(0).firstChild;
    var nodeValue = h2Lista.item(0).firstChild.nodeValue;
    var textContent = h2Lista.item(0).textContent;
    console.log(firstChild);
    console.log(nodeValue);
    console.log(textContent);*/
    for (let i = 0; i < h2Lista.length; i++) {
        h2Lista[i].textContent = i+1 + ". " + h2Lista[i].textContent;
    }
}

function muutaNakyvyys(e) {
    //console.log(e.target.nodeName);
    var lista = e.target.nextSibling.nextSibling;
    //console.log(lista);
    if (e.target.getAttribute("src") === "minus.jpg") {
        e.target.setAttribute("src", "plus.jpg");
        e.target.setAttribute("alt", "Kiinni");
        lista.className = "hide";
    } else {
        e.target.setAttribute("src", "minus.jpg");
        e.target.setAttribute("alt", "Auki");
        lista.removeAttribute("class");
    }
}

function linkit(id) {
    var ul = document.getElementById(id);
    var linkit = ul.getElementsByTagName("a");
    for (var i = 0; i < linkit.length; i++) {
        var href = " " + linkit[i].getAttribute("href");
        var hrefNode = document.createTextNode(href);
        linkit[i].parentNode.appendChild(hrefNode);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function luoLasku(rivi) {
    var LUKU1 = getRandomInt(0, 100);
    var LUKU2 = getRandomInt(0, 100);
    var p1 = document.createElement('p');
    var span1 = document.createElement('span');
    span1.setAttribute('id', 'ekaluku_rivi' + rivi);
    p1.appendChild(span1);
    var txt1 = document.createTextNode(LUKU1);
    span1.appendChild(txt1);
    var txt2 = document.createTextNode(' + ');
    p1.appendChild(txt2);
    var span2 = document.createElement('span');
    span2.setAttribute('id', 'tokaluku_rivi' + rivi);
    p1.appendChild(span2);
    var txt3 = document.createTextNode(LUKU2);
    span2.appendChild(txt3);
    var txt4 = document.createTextNode(' = ');
    p1.appendChild(txt4);
    var input1 = document.createElement('input');
    input1.setAttribute('id', 'summa_rivi' + rivi);
    input1.setAttribute('size', '3');
    input1.setAttribute('type', 'text');
    p1.appendChild(input1);
    return p1;
}

function luoLaskut(laskuja) {
    var laskuAlue = document.getElementById("laskut");
    for (var i = 0; i < laskuja; i++) {
        var lasku = luoLasku(i);
        laskuAlue.appendChild(lasku);
    }
}

function tarkistaLaskut() {
    var eka = 0;
    var toka = 0;
    var vastaus = 10;
    var oikeita = 0;
    for (var i = 0; i < laskujenMaara; i++) {
        eka = parseInt(document.getElementById("ekaluku_rivi" + i).textContent);
        toka = parseInt(document.getElementById("tokaluku_rivi" + i).textContent);
        var vastausRuutu = document.getElementById("summa_rivi" + i);
        vastaus = parseInt(vastausRuutu.value);
        if (eka + toka === vastaus) {
            vastausRuutu.removeAttribute("class");
            oikeita++;
        } else {
            vastausRuutu.className = "virhe";
            virheita = 1;
        }
    }
    if ((oikeita === laskujenMaara) && virheita) {
        var oikein = document.createTextNode("Kaikki vastaukset oikein!!");
        document.getElementById("tarkista").parentNode.appendChild(oikein);
        virheita = 0;
    }
}

function varoitus(e) {
    alert("Hello World!!");
}

//Globaalit muuttujat
var laskujenMaara = 10;
var virheita = 1;

window.onload = function () {
    numeroi();
    var menu = document.getElementById("menu");
    var kuvat = menu.getElementsByTagName("img");
    for (let i = 0; i < kuvat.length; i++) {
        kuvat[i].addEventListener("click", muutaNakyvyys);
    }
    linkit("linkit");
    luoLaskut(laskujenMaara);
    document.getElementById("tarkista").addEventListener("click", tarkistaLaskut);
    document.getElementById("hello").addEventListener("dblclick", varoitus);
};
