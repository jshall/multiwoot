function load() {
	var optW = $('options').offsetWidth;
	var w = 
		$('0').offsetWidth + 4 +
		$('1').offsetWidth + 4 +
		$('2').offsetWidth + 4 +
		$('3').offsetWidth + 4 +
		$('4').offsetWidth + 9;
	$('sites').style.width = w;
	$('options').style.marginLeft = (w - optW) / 2;
	document.body.style.width = w + 10;
	
	if (System.Gadget.Settings.read("interval")) {
		$('options').interval.value = System.Gadget.Settings.read("interval");
		$('options').auto.checked = System.Gadget.Settings.read("auto");
		$('options').halt.checked = System.Gadget.Settings.read("halt");
	}
}
System.Gadget.onSettingsClosing = function(event) {
	if (event.closeAction == event.Action.commit) {
		System.Gadget.Settings.write("interval", $('options').interval.value);
		System.Gadget.Settings.write("auto", $('options').auto.checked);
		System.Gadget.Settings.write("halt", $('options').halt.checked);
	}
}
