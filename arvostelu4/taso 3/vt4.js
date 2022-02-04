// globaalit muuttujat
let maxPalkit = 10;
let palkkienMaara = 0;
let vasenViimeksi = true;
let atFuncs = ["ease", "ease-in", "ease-out", "linear", "ease-in-out"];
let scroll;

let paikka = 1000;
/*
	Suoritetaan html-dokumentin latauduttua
*/
window.onload = function() {
	lisaaPolloButton();
	piirraPupu();
	//paikka = document.body.clientWidth;
	luoCanvas();
	let ekaPalkki = document.getElementById("palkki");
	ekaPalkki.addEventListener("animationstart", function() {
		piirraPalkit();
	});
}

/*
	piirretään palkit niin, että viimeinen palkki luodaan, kun ensimmäisen palkin animaatio osuu
	sivun oikeaan laitaan. Palkkien määrällä ei ole väliä. Palkkeja piirretään niin kauan
	kunnes ennalta määrätty maksimimäärä on saavutettu
*/
function piirraPalkit() {
	if (maxPalkit > palkkienMaara) {
		
		setTimeout(function() {
			let div = document.getElementsByClassName("palkit");
			let palkki = luoPalkki();
			div[0].appendChild(palkki);
			palkkienMaara++;
		}, 2500/maxPalkit);
		
	}

	
}

/*
	luodaan objekti, joka sisältää ennalta määritellyn svg-kuvan
	@return objekti, joka sisältää svg:n
*/
function luoPalkki() {
	let object = document.createElement("object");
	object.type = "image/svg+xml";
	object.data = "palkki.svg";
	object.addEventListener("animationstart", function() {
		piirraPalkit();
	});

	return object;
}

/*
	lisätään canvaksiin jäniksen kuvat ja rajataan ne niin, että
	kumpikin kuva näyttää eri puolikkaan jäneksestä
*/
function piirraPupu() {
	let canvas1 = document.getElementById("pupu1").getContext("2d");
	let canvas2 = document.getElementById("pupu2").getContext("2d");

	let img = new Image();
	img.onload = function() {
		canvas1.drawImage(img, 191.5, 0, 383, 600, 191.5, 0, 383, 600);
		canvas2.drawImage(img, 0, 0, 191.5, 600, 0, 0, 191.5, 600);
	}
	img.src = "bunny.png";
}

/*
	Lisätään sivulle painike, josta voi luoda uuden pöllön
*/
function lisaaPolloButton() {
	let button = document.createElement("button");
	button.id = "lisaaPollo";
	button.textContent = "Lisää pöllö";
	button.addEventListener("click", function(e) {
		e.preventDefault();
		luoPollo();
	});

	let div = document.getElementsByClassName("button");
	div[0].appendChild(button);
}


/*
	Luodaan objekti, joka sisältää svg-kuvan pöllöstä. Pöllön animaatiosuunta
	määritetään joka toinen kerta alkamaan oikealta
*/
function luoPollo() {
	let object = document.createElement("object");
	object.type = "image/svg+xml";
	object.data = "siipiveikko.svg";

	if (vasenViimeksi) {
		object.className = "oikea";
		vasenViimeksi = false;
	} else {
		object.className = "vasen";
		vasenViimeksi = true;
	}

	object.style.animationTimingFunction = atFuncs[Math.floor((Math.random() * 10) / 2)];
	let div = document.getElementsByClassName("lintu");
	div[0].appendChild(object);
}




//--------------------------kesken jäänyt canvas-skrolleri-----------------------//
/*
	Luodaan canvas, jonka pohjalle luodaan skrolleri läpikäytävälle tekstille
*/
function luoCanvas() {
	let canvas = document.createElement("canvas");
	canvas.width = document.body.clientWidth * 2;
	canvas.height = document.body.clientWidth * 0.15;
	let context = canvas.getContext("2d");
	context.fillStyle = "#fffa00";
	context.fillText("testotestotestotestotesto", 0, 50);
	let div = document.getElementsByClassName("skrolleri");
	div[0].appendChild(canvas);
	scroll = canvas;

	window.requestAnimationFrame(animateScroll);
}


function animateScroll() {
	scroll.style.marginLeft = paikka + "px";
	paikka--;
	if (paikka < 0) paikka = document.body.clientWidth;
	window.requestAnimationFrame(animateScroll);
	//console.log(ctx.measureText(text));
}