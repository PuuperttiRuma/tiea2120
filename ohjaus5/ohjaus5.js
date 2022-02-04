$(function() {
	
	//DOM-inspection	
	var textInputs = $("input[type='text']");
	textInputs.each(function () {
		console.log($(this).val());
	});
	textInputs.filter("[required]").each(function(){
		console.log($(this).val());
	});
	$("input[type='text'][required]").each(function(){
		console.log($(this).val());
	});
	$("input[type='text'][required]").val("foobar");

	/*textInputs.on("change", function(){
		if($(this).val()){
			console.log($(this).val());
		}
	});*/

	//Event handling
	$("form").on("change", function(event){
		event.preventDefault();
		var target = $(event.target);
		console.log(target.attr("name") + ": " + target.val());
		console.log(event.target);
		console.log(event.originalEvent);
		console.log(event.type);
	});

	$("form").on("click", function(event){
		console.log(event.clientX + ", "+ event.clientY);
		//console.log(event);
	});

	//DOM-manipulation
	$("label").first().clone().appendTo($("form"));
	$("label").first().next().remove();
	$("form").append($("label").first());
	$("label").first().appendTo($("form"));

	$("<button>Lähetä tiedot</button>").appendTo("form");

	
	$("input").css("fontSize", "16px");

	//jQuery UI
		$("#datepicker").datepicker();
	//regional settingsit ei toimi :(
	
	$("#tabs").tabs();
	$("button").on("click", function(event){
		event.preventDefault();
		$("#dialog").dialog({
			resizable: false,
			height: "auto",
			width: 400,
			modal: true,
			buttons: {
				"Lähetä tiedot": function() {
					$(this).dialog("close");
				},
				"Peruuta": function() {
					$(this).dialog("close");
				}
			}
		});
	});

	$("form").sortable();

	//Drag & Drop
	var drag = document.getElementById("drag");
	drag.setAttribute("draggable", "true");
	drag.addEventListener("dragstart", function(event){
		event.dataTransfer.setData("text/plain", drag.getAttribute("id"));
	});
	var drop = document.getElementById("drop");
	drop.addEventListener("dragover", function(event){
		event.preventDefault();
		event.dataTransfer.dropEffect = "move"
	});
	drop.addEventListener("drop", function(event){
		event.preventDefault();
		var data = event.dataTransfer.getData("text");
		event.target.appendChild(document.getElementById(data));
	});
});