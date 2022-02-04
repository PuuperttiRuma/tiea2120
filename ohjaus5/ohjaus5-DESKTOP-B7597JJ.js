$(document).ready(function () {
    var inputs = $("input[type='text']");
    inputs.each(function () {
        console.log($(this).val());
    });

    var requiredInputs = inputs.filter("[required]");
    requiredInputs.each(function () {
        console.log($(this).val());
    });
    var oikotie = $("input[type='text'][required]");
    oikotie.each(function () {
        console.log($(this).val());
    });
    inputs.val("foobar");


    /*inputs.on("change", function () {
        if ($(this).val()) {
            console.log($(this).val());
        }
    });*/

    $("form").on("change", "input[type='text']", function (e) {
        console.log($(e.target).val());
        console.log($(e.target).attr("name"));
        console.log($(this).val());
        console.log($(this).attr("name"));
        /*
        console.log(e);
        console.log(e.target);
        console.log(e.originalEvent);
        console.log(e.type);
        */
    });

    $("form").on("click", function (e) {
        console.log(e.pageX + ", " + e.pageY);
    });

    $("form").append($("label").first());
    //$("label").first().appendTo("form");
    $("label").last().clone().appendTo("form");
    $("label:contains('Malli2')").remove();

    var button = $("<button>Submit</button>");
    $("form").append(button);

    /*
    $(function() {
        $("label").draggable();
    });*/

    $(function () {
        $("form").sortable({
            revert: true
        });        
        $("form").disableSelection();
    })

    $(function () {
        $("#dialog").dialog({
            autoOpen: false,
            height: "auto",
            width: 300,
            modal: true,
            buttons: {
                "Kyll‰": function () {
                    $(this).dialog("close");
                },
                "Ei sittenk‰‰n": function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    button.on("click", function (e) {
        e.preventDefault();
        $("#dialog").dialog("open");
    });
    //console.log(inputs.css("font-size", "15px"));



    $(function () {
        $("#datepicker").datepicker();
    });

    $(function () {
        $("#tabs").tabs();
    });

});
window.onload = function () {
    var drag = document.getElementById("drag");
    drag.setAttribute("draggable", "true");
    drag.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", drag.getAttribute("id"));
    });
    var drop = document.getElementById("drop");
    drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });
    drop.addEventListener("drop", function (e) {
        e.preventDefault();
        var data = e.dataTransfer.getData("text");
        console.log(data);
        e.target.appendChild(document.getElementById(data));
    });
};