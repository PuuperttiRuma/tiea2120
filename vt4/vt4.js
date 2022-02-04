"use strict";

/**********************
* Globaalit muuttujat *
**********************/

var CSS_ANIMATION_TIMINGS = new Array("ease", "ease-in", "ease-out", "ease-in-out", "linear");

var VASENPUPUCTX;
var OIKEAPUPUCTX;
var PUPUIMG;
var PUPUNPUOLIVALI;
var PUPUANIMFRAME = 0;
var PUPUANIMKESTO = 20.0;

var SKROLLERICTX;
var SKROLLERI_X = window.innerWidth - 10.0;
var SKROLLERINOPEUS = 1.5;

window.onload = function () {
    window.addEventListener("resize", paivitaKoot);
    document.getElementById("lisaaPolloNappi").addEventListener("click", lisaaPollo);
    luoSkrolleri();
    window.requestAnimationFrame(piirraSkrolleri);
    luoPuput();
    window.requestAnimationFrame(pupunMuljutusAnim);
    //luodaan liikkuvat neonpalkit
    for (let i = 0; i < 10; i++) {
        let timeoutID = window.setTimeout(luoNeonpalkki, 350 * i);
    }
};

/**
 * @summary: Piirtää sivulle skrollerin ja animoi sitä.
 */
function piirraSkrolleri() {
    var teksti = "TIEA2120 Web-käyttöliittymien ohjelmointi -kurssin viikkotehtävä 4 taso 3 edellyttää skrollerin toteuttamista. Tämä skrolleri toimii tekstin määrästä riippumatta";
    var x = parseInt(SKROLLERI_X);    
    SKROLLERICTX.clearRect(0, 0, window.innerWidth, 200);
    SKROLLERICTX.fillText(teksti, x, 160);
    if (SKROLLERICTX.measureText(teksti).width + SKROLLERI_X > 0) {
        SKROLLERI_X -= SKROLLERINOPEUS;
        window.requestAnimationFrame(piirraSkrolleri);
    }
}

/**
 * @summary: Luo canvas-elementit skrollerille ja tallentaa luodun Context2d:n
 *           globaaliin muuttujaan.
 */
function luoSkrolleri() {
    var canvas = luoCanvas(window.innerWidth*2, 200, "skrolleri");
    document.querySelector("body").appendChild(canvas);

    SKROLLERICTX = canvas.getContext("2d");
    SKROLLERICTX.font = "160px Arial";
    var gradient = SKROLLERICTX.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(0.5, "yellow");
    gradient.addColorStop(1, "black");
    SKROLLERICTX.fillStyle = gradient;

}

/**
 * @summary: Lisää sivulle pöllön ja arpoo sille satunnaisen CSS-animaation.
 *           Joka toisen pöllön animaatio kulkee vastakkaiseen suuntaan.
 */
function lisaaPollo() {
    var body = document.querySelector("body");
    var img = document.createElement("img");
    img.setAttribute("src", "owl.svg");
    img.setAttribute("class", "pollo");
    img.setAttribute("alt", "Pöllö");
    body.appendChild(img);

    //Joka toiselle pöllölle animaatio päin vastaiseen suuntaan
    if (document.querySelectorAll(".pollo").length % 2) {
        img.style.animationDirection = "reverse";
    }
    else {
        img.style.animationDirection = "normal";
    }

    //Satunnainen animointi pöllölle
    var apunumero = Math.floor( Math.random() * (CSS_ANIMATION_TIMINGS.length-1) );
    var animation = CSS_ANIMATION_TIMINGS[apunumero];
    img.style.animationTimingFunction = animation;    
}

/**
 * @summary: Luo canvas-elementit kahdelle pupulle ja tallentaa luodut Context2d:t
 *           globaaleihin muuttujiin.
 */
function luoPuput() {
    var body = document.querySelector("body");
    PUPUIMG = document.getElementById("pupuImg");
    PUPUNPUOLIVALI = parseInt(PUPUIMG.naturalWidth) / 2;
    var korkeus = window.innerHeight;

    var vasen = luoCanvas(PUPUNPUOLIVALI, korkeus, "pupu-vasen");
    var oikea = luoCanvas(PUPUNPUOLIVALI, korkeus, "pupu-oikea");
    body.appendChild(vasen);
    body.appendChild(oikea);
    vasen.setAttribute("class", "pupu");
    oikea.setAttribute("class", "pupu");

    VASENPUPUCTX = vasen.getContext('2d');
    OIKEAPUPUCTX = oikea.getContext('2d');
}

/**
 * @summary: Piirtää puput käyttäen globaaleja muuttujia ja muljuttaa niitä.
 */
function piirraPuput() {
    //Tyhjennetään Canvakset ennen uutta piirtoa
    VASENPUPUCTX.clearRect(0, 0, PUPUNPUOLIVALI, window.innerHeight);
    OIKEAPUPUCTX.clearRect(0, 0, PUPUNPUOLIVALI, window.innerHeight);

    //Piirretään vasen pupu
    skaalaaPupu(VASENPUPUCTX, PUPUIMG, window.innerHeight, PUPUNPUOLIVALI);

    //Piirretään oikea pupu ja käännetään se
    OIKEAPUPUCTX.save();
    OIKEAPUPUCTX.translate(PUPUNPUOLIVALI, 0);
    OIKEAPUPUCTX.scale(-1, 1);
    skaalaaPupu(OIKEAPUPUCTX, PUPUIMG, window.innerHeight, PUPUNPUOLIVALI);
    OIKEAPUPUCTX.restore();
}

/**
 * @summary: Animoi puput.
 */
function pupunMuljutusAnim() {
    piirraPuput();
    if (PUPUANIMFRAME/PUPUANIMKESTO > 2 * Math.PI) {
        PUPUANIMFRAME = 0;
    }
    PUPUANIMFRAME++;
    window.requestAnimationFrame(pupunMuljutusAnim);
}

/**
 * @summary: Ottaa pupun kuvan ja muotoilee sitä sinikäyrän mukaan pixeli kerrallaan.
 * @param {CanvasRenderingContext2D} ctx: Käytetyn Canvaksen 2d-contexti
 * @param {Element} img: HTML-img-elementti joka piirretään
 * @param {int} korkeus: alkuperäisen kuvan korkeus
 * @param {int} leveys: alkuperäisen kuvan leveys
 */
function skaalaaPupu(ctx, img, korkeus, leveys) {
    var skaala = 1;
    var laajuus = 2;
    var y = 0;

    for (let i = 0; i < korkeus - 1; i++) {
        skaala = parseInt( 1.0 + (Math.sin(1.0 * (i + PUPUANIMFRAME) / PUPUANIMKESTO) + 1.0) * laajuus );  
        ctx.drawImage(img, 0, i, leveys, 1, 0, y, leveys, skaala);
        y += skaala;
    }
}

/**
 * @summary: Luo canvas-elementin annetuilla arvoilla ja palauttaa sen
 * @param {int} leveys: canvaksen haluttu leveys integerinä tai stringinä
 * @param {int} korkeus: canvaksen haluttu korkeus integerinä tai stringinä
 * @param {string} id: Canvaksen id
 * @return {canvas}: Luotu Canvas-elementti
 */
function luoCanvas(leveys, korkeus, id) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", parseInt(leveys));
    canvas.setAttribute("height", parseInt(korkeus));
    canvas.setAttribute("id", id);
    return canvas;
}

/**
 * @summary: Luo neonpalkin.
 */
function luoNeonpalkki() {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    svg.appendChild(rect);
    svg.setAttribute("class", "neonpalkki");
    svg.setAttribute("version", "1.1.");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", window.innerHeight);

    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "green");

    document.querySelector("body").appendChild(svg);
}

/**
 * @summary: Päivittää pupujen ja neonpalkkien korkeuden vastaamaan ikkunan kokoa.
 */
function paivitaKoot() {
    var palkit = document.querySelectorAll(".neonpalkki");
    for (let svg of palkit) {
        svg.setAttribute("height", window.innerHeight);
    }
    var puput = document.querySelectorAll(".pupu");
    for (let canvas of puput) {
        canvas.setAttribute("height", window.innerHeight);
    }
}