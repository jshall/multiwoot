var woot = new Woot(Array(
	//Data(prefix, logoColor, backgroundColor, textareaColor) 
	new Data("www", "#61861E", "#61861E", "#91AB62"),
	new Data("wine", "#8A1B26", "#8A1B26", "#AD5D62"),
	new Data("shirt", "#216294", "#216294", "#5A8BB0"),
	new Data("sellout", "#4B437D", "#4B437D", "#8A85AA"),
	new Data("kids", "#E19433", "#FFE086", "#E19433")
));

function flyout() {
    System.Gadget.Flyout.show = !System.Gadget.Flyout.show;
}

function alert(errorMessage) {
	clearTimeout(this.errorTimer);
	if (errorMessage || errorMessage == '') {
		$('msg').innerHTML = '';
		$('msg').style.visibility='hidden';
	} else {
		$('msg').innerHTML = errorMessage;
		$('msg').style.visibility='visible';
		this.errorTimer = setTimeout(alert, woot.timer.interval*0.9);
	}
}

window.onload = function() {
	try {
		System.Gadget.onDock = woot.resizeCallback;
		System.Gadget.onUndock = woot.resizeCallback;
		System.Gadget.Flyout.onShow = woot.updateCallback;
		System.Gadget.Flyout.onHide = woot.updateCallback;
		System.Gadget.onSettingsClosed = woot.settingsCallback;
	} catch(ex) {
		window.System = {Gadget:{docked:true,Flyout:{show:false,document:null}}};
		System.Gadget.watch("docked", function (p,o,n){setTimeout(woot.resizeCallback,5);return n});
		System.Gadget.Flyout.watch("show", function (p,o,n){setTimeout(woot.updateCallback,5);return n});
	}
	System.Gadget.Flyout.file = "flyout.html";
	System.Gadget.settingsUI = "settings.html";
	woot.timer.start();
	woot.resize();
}
