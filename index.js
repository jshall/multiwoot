var woot;

function flyout() {
    System.Gadget.Flyout.show = !System.Gadget.Flyout.show;
}

function alert(errorMessage) {
	clearTimeout(this.errorTimer);
	if (!errorMessage) {
		$('msg').innerHTML = '';
		$('msg').style.visibility='hidden';
	} else {
		$('msg').innerHTML = errorMessage;
		$('msg').style.visibility='visible';
		this.errorTimer = setTimeout(alert, woot.timer.interval*0.9);
	}
}

window.onload = function() {
	System.Gadget.Flyout.file = "flyout.html";
	System.Gadget.settingsUI = "settings.html";
	woot = new Woot(
		//Data(prefix, logoColor, backgroundColor, textareaColor, teaserColor) 
		new Data("www",     "#61861E", "#61861E", "#91AB62", "#FFFFFF"),
		new Data("wine",    "#8A1B26", "#8A1B26", "#AD5D62", "#FFFFFF"),
		new Data("shirt",   "#216294", "#216294", "#5A8BB0", "#FFFFFF"),
		new Data("sellout", "#4B437D", "#4B437D", "#8A85AA", "#FFFFFF"),
		new Data("kids",    "#E19433", "#FFE086", "#E19433", "#FFFFFF"),
		new Data("home",    "#D35500", "#EFEAE6", "#EFEAE6", "#D35500")
	);
	System.Gadget.onDock = woot.resizeCallback;
	System.Gadget.onUndock = woot.resizeCallback;
	System.Gadget.Flyout.onShow = woot.updateCallback;
	System.Gadget.Flyout.onHide = woot.updateCallback;
	System.Gadget.onSettingsClosed = woot.settingsCallback;
	woot.update();
}
