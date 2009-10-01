var selection = null;
var moved = false;
var lastX = null;
var list = [{prefix:"www"},{prefix:"wine"},{prefix: "shirt"},{prefix: "sellout"},{prefix: "kids"}];

function select() {
	selection = this;
}
function move(ev) {
	ev = ev || window.event;
	var self = this;
	if( selection && self != selection ) {
		if( ev.clientX < lastX ) {
			moved = true;
			selection.parentElement.removeChild(selection);
			self.parentElement.insertBefore(selection, self);
		} else {
			moved = true;
			selection.parentElement.removeChild(selection);
			self.parentElement.insertBefore(selection, self.nextSibling);
		}
	}
	lastX = ev.clientX;
}
function done() {
	if( selection ) {
		if( !moved ) {
			selection.style.filter = selection.style.filter ? '' : 'alpha(opacity=50)';
			selection.tag.disabled = (selection.style.filter == 'alpha(opacity=50)');
		}
		selection = null;
		moved = false;
	}
}

function load() {
	var desc = $('desc'); var w = 6;
	for( i in list ) if( list[i].prefix ) {
		var item = document.createElement('div');
		item.className = 'panel';
		item.innerHTML = '<img src="'+list[i].prefix+'.png" />';
		desc.parentElement.insertBefore(item, desc);
		w += item.offsetWidth + 4;
		item.onmousedown = select;
		item.onmouseover = move;
		item.onmouseup = done;
		item.tag = list[i];
	}
	$('sites').style.width = w;
	$('options').style.marginLeft = (w - $('options').offsetWidth) / 2;
	document.body.style.width = w + 10;
	
	if( window.System ) {
		if (System.Gadget.Settings.read("interval")) {
			$('options').interval.value = System.Gadget.Settings.read("interval");
			$('options').auto.checked = System.Gadget.Settings.read("auto");
			$('options').halt.checked = System.Gadget.Settings.read("halt");
		}
		System.Gadget.onSettingsClosing = function(event) {
			if (event.closeAction == event.Action.commit) {
				System.Gadget.Settings.write("interval", $('options').interval.value);
				System.Gadget.Settings.write("auto", $('options').auto.checked);
				System.Gadget.Settings.write("halt", $('options').halt.checked);
			}
		}
	}
}
