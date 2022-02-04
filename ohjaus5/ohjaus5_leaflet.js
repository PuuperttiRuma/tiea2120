// kirjoita tänne oma ohjelmakoodisi
window.onload = function () {
    var div = $("#map");
    div.css("width", Math.round(window.innerWidth) + "px");
    div.css("height", Math.round(window.innerHeight) + "px");

    var mymap = new L.map('map', {
        crs: L.TileLayer.MML.get3067Proj()
    }).setView([62.2333, 25.7333], 11);
    L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(mymap);

    var circle = L.circle(
        [62.2325, 25.7355], {
            color: "green",
            fillColor: "#f03",
            fillOpacity: 0.5,
            radius: 50
        }
    ).addTo(mymap);
    circle.bindPopup("Jiihaa!");


    var koordinaatit = [
        [62.2325, 25.7355],
        [62.233, 25.7333],
        [62.23, 25.73],
        [62.232, 25.7222]
    ];
    var polyline = L.polyline(koordinaatit, { color: "blue" }).addTo(mymap);

    var marker = L.marker([62.2333, 25.7333], {
        draggable: "true"
    }).addTo(mymap);
    marker.bindPopup("Paikka : " + marker.getLatLng() + "").openPopup();
    marker.addEventListener("dragend", function (e) {
        marker.bindPopup("Paikka : " + marker.getLatLng() + "").openPopup();
        polyline.addLatLng(marker.getLatLng());
        //mymap.locate({ setView: true, maxZoom: 16 });
    });

};
