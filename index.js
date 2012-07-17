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

function size() {
	return (System.Gadget.docked ? 0 : 1);
}

window.onload = function() {
	System.Gadget.Flyout.file = "flyout.html";
	System.Gadget.settingsUI = "settings.html";
	woot = new Woot(
		//Data(prefix, logoColor, backgroundColor, textareaColor, teaserColor, logoWidth, logoPos) 
		new Data("www",     "#669510", "#7CA71E", "#3E6906", "#FFFFFF", "57px", "-88px -1px"),
		new Data("tech",    "#108487", "#46A0A2", "#095153", "#FFFFFF", "48px", "-88px -199px"),
		new Data("home",    "#D35500", "#DB6D00", "#B83000", "#D35500", "59px", "-88px -45px"),
		new Data("sport",   "#6ABB01", "#8CCA3B", "#407601", "#FFFFFF", "54px", "-88px -177px"),
		new Data("kids",    "#EFA602", "#FFBD18", "#FF9909", "#FFFFFF", "44px", "-88px -67px"),
		new Data("shirt",   "#0071B0", "#0087BE", "#004789", "#FFFFFF", "48px", "-88px -133px"),
		new Data("wine",    "#891B28", "#9C2F3F", "#5E0C13", "#FFFFFF", "51px", "-88px -155px"),
		new Data("sellout", "#467C32", "#5E914A", "#265019", "#FFFFFF", "67px", "-88px -110px")
	);
	System.Gadget.onDock = woot.resizeCallback;
	System.Gadget.onUndock = woot.resizeCallback;
	System.Gadget.Flyout.onShow = woot.updateCallback;
	System.Gadget.Flyout.onHide = woot.updateCallback;
	System.Gadget.onSettingsClosed = woot.settingsCallback;
	woot.update();
}
