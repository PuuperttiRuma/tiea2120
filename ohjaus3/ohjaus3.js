// JavaScript source code
"use strict";

var kurssit = new Set();


window.onload = function () {
    let email = document.querySelector('input[type="email"]');
    console.log(email);

    email.addEventListener("input", function (e) {
        let email = e.target;
        if (email.validity.typeMismatch) {
            email.setCustomValidity("Syötä @student.jyu.fi -päätteinen sähköpostiosoite");
        } else {
            email.setCustomValidity("");
        }
    });

    var kurssitCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    for (let i of kurssitCheckboxes) {
        i.addEventListener("click", kurssiValittu);
    }
};

function kurssiValittu(e) {
    if (e.target.checked) {
        kurssit.add(e.target.value);
    } else {
        kurssit.delete(e.target.value);
    }
    if (kurssit.size === 0) {
        for (let i of kurssitCheckboxes) {
            i.setCustomValidity("Valitse vähintään yksi kurssi");
        }
    } else if (kurssit.size > 0) {
        for (let i of kurssitCheckboxes) {
            i.setCustomValidity("");
        }
    }
}

