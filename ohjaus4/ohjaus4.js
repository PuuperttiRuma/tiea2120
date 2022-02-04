window.onload = function () {
    //piirraCanvas();
    let h1 = document.querySelector('h1');
    h1.className = "otsikko";
    h1.addEventListener("animationstart", animlistener);
    h1.addEventListener("animationend", animlistener);
    h1.addEventListener("animationiteration", animlistener);

    function animlistener(e) {
        console.log(e.type + " : " + e.elapsedTime);
    }

    h1.style.animationDuration = "2s";
    h1.style.animationIterationCount = "3";

    
    
};

function piirraCanvas() {
    var canvas = document.getElementById("canvas");
    var img = document.querySelector("img");
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 10, 30, 115, 85, 0, 0, 230, 170);
    ctx.drawImage(img, 10, 30, 115, 85, 240, 85, 115, 85);
    ctx.fillRect(0, 170, 400, 10);
    ctx.strokeRect(0, 0, 800, 600);
    ctx.font = '48px serif';
    var txtMeasure = ctx.measureText("Terve maailma!");
    ctx.fillText("Terve maailma!", 400 - txtMeasure.width / 2, 300);
    ctx.fillStyle = 'yellow';
    ctx.arc(700, 40, 30, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.strokeStyle = 'yellow';

    ctx.beginPath();
    ctx.moveTo(700 - 30 - 10, 40);
    ctx.lineTo(700 - 30 - 10 - 60, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(700 - 35, 60);
    ctx.lineTo(700 - 30 - 10 - 40, 80);
    ctx.stroke();

    ctx.save();
    ctx.translate(60, 345);
    ctx.scale(-1, 1);
    ctx.rotate(Math.PI / 180 * 45);
    ctx.drawImage(img, 12, 30, 120, 90, -60, 0, 120, 90);
    ctx.restore();

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    let max = 800;
    let nopeus = 800.0 / 16.0;
    let laajuus = 150.0;
    for (let i = 0; i < max; i++) {
        let y = parseInt((Math.sin(1.0 * i / nopeus) + 1.0) * laajuus);
        ctx.lineTo(i, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.bezierCurveTo(200, 400, 300, 400, 100, 500);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(400, 300);
    ctx.quadraticCurveTo(700, 400, 500, 100);
    ctx.stroke();

    ctx.save();
    ctx.translate(600, 400);
    ctx.rotate(Math.PI / 180 * 90);
    var pylvaat = new Path2D();
    var korkeudet = [79, 81, 75];
    var palkkileveys = 40;
    var xOffset = palkkileveys + 10;

    for (let i = 0; i < korkeudet.length; i++) {
        pylvaat.rect(i * xOffset, 100 - korkeudet[i], palkkileveys, korkeudet[i]);
    }
    ctx.fillStyle = 'black';
    ctx.fill(pylvaat);
    ctx.font = '12px sans-serif';
    for (let i = 0; i < korkeudet.length; i++) {
        let tM = ctx.measureText(korkeudet[i]);
        ctx.fillText(korkeudet[i], i * xOffset + palkkileveys / 2 - tM.width / 2, 100 - korkeudet[i] - 2);
    }
    var selitteet = ["Demo 1", "Demo 2", "Demo 3"];
    for (let i = 0; i < selitteet.length; i++) {
        let tM = ctx.measureText(selitteet[i]);
        ctx.fillText(selitteet[i], i * xOffset + palkkileveys / 2 - tM.width / 2, 112);
    }
}