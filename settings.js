var selection = null;
var moved = false;
var lastX = null;

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
			selection.style.filter = selection.dim ? '' : 'alpha(opacity=50)';
			selection.dim = !selection.dim;
		}
		selection = null;
		moved = false;
	}
}

function load() {
	var order = System.Gadget.Settings.read("order").split(',');
	$('options').interval.value = System.Gadget.Settings.read("interval");
	$('options').auto.checked = System.Gadget.Settings.read("auto");
	$('options').halt.checked = System.Gadget.Settings.read("halt");
	System.Gadget.onSettingsClosing = close;

	var desc = $('desc'); var w = 6;
	for( var i=0; order[i]; i++ ) {
		var item = document.createElement('div');
		item.prefix = order[i].replace(/-/,'');
		item.className = 'panel';
		item.innerHTML = '<img src="' + item.prefix + '.png" />';
		desc.parentElement.insertBefore(item, desc);
		w += item.offsetWidth + 4;
		item.onmousedown = select;
		item.onmouseover = move;
		item.onmouseup = done;
		if( order[i].match(/-/) ) {
			item.style.filter = 'alpha(opacity=50)';
			item.dim = true;
		}
	}
	$('sites').style.width = w;
	$('options').style.marginLeft = (w - $('options').offsetWidth) / 2;
	document.body.style.width = w + 10;
}
function close(event) {
	if (event.closeAction == event.Action.commit) {
		var obj = $('sites').firstChild;
		var order = '';
		while( obj.prefix ) {
			order += (order ? ',' : '') + (obj.dim ? '-' : '') + obj.prefix;
			obj = obj.nextSibling;
		}
		System.Gadget.Settings.write("order", order);
		System.Gadget.Settings.write("interval", $('options').interval.value);
		System.Gadget.Settings.write("auto", $('options').auto.checked);
		System.Gadget.Settings.write("halt", $('options').halt.checked);
	}
}