var woot;

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
	System.Gadget.Flyout.file = "flyout.html";
	System.Gadget.settingsUI = "settings.html";
	if( System.Gadget.Settings.read("order") == '' )
		System.Gadget.Settings.write("order", 'www,wine,shirt,sellout,kids');
	if( System.Gadget.Settings.read("interval") == '' )
		System.Gadget.Settings.write("interval", 5);
	if( System.Gadget.Settings.read("auto") == '' )
		System.Gadget.Settings.write("auto", true);
	if( System.Gadget.Settings.read("halt") == '' )
		System.Gadget.Settings.write("halt", true);
	woot = new Woot(
		//Data(prefix, logoColor, backgroundColor, textareaColor) 
		new Data("www", "#61861E", "#61861E", "#91AB62"),
		new Data("wine", "#8A1B26", "#8A1B26", "#AD5D62"),
		new Data("shirt", "#216294", "#216294", "#5A8BB0"),
		new Data("sellout", "#4B437D", "#4B437D", "#8A85AA"),
		new Data("kids", "#E19433", "#FFE086", "#E19433")
	);
	System.Gadget.onDock = woot.resizeCallback;
	System.Gadget.onUndock = woot.resizeCallback;
	System.Gadget.Flyout.onShow = woot.updateCallback;
	System.Gadget.Flyout.onHide = woot.updateCallback;
	System.Gadget.onSettingsClosed = woot.settingsCallback;
}
