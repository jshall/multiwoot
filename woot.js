var dimmer = {
	timer: null,
	active: false,
	low: 25,
	show: function() {
		clearTimeout(this.timer);
		this.active = true;
		this.fade(this.low);
	},
	hide: function() {
		this.active = false;
		this.timer = setTimeout(this.fadeCallback(this.low), 200);
	},
	fadeCallback: callback('fade'),
	fade: function(prcnt) {
		// item image back to 100% opacity and hide the text
		if (prcnt < 100) {
			$('title').style.visibility = (this.active) ? 'visible' : 'hidden';
			if (!this.active) this.timer = setTimeout(this.fadeCallback(prcnt+1), 5);
			$('itemImage').style.filter = "alpha(opacity="+prcnt+")";
		} else {
			$('itemImage').style.filter = "alpha(opacity=100)";
			$('title').style.visibility = 'hidden';
		}
	}
}

var Data = function(prefix, logoColor, backgroundColor, textareaColor) {
	this.prefix = prefix;
	this.logoColor = logoColor;
	this.backgroundColor = backgroundColor;
	this.textareaColor = textareaColor;

	this.link = '';
	this.title = 'Unknown';
	this.image = Array('www.png','www.png');
	this.price = '$0.00';
	this.buyIt = '';
	this.progress = null;
};
Data.prototype = {
	show: function() {
		$('logo').style.backgroundColor = this.logoColor;
		$('prefixImage').src = this.prefix+'.png';
		
		$('home').href = this.link;
		$('title').innerHTML = this.title;
		if (typeof(size) != 'undefined')
		$('itemImage').src = this.image[size];
		$('price').innerHTML = this.price;
		$('price').href = this.buyIt;
		$('meter').style.width = this.progress;
		cssStyles('.light')[0].visibility = (this.wootoff ? 'visible' : 'hidden');
		$('soldout').style.visibility = (this.soldout ? 'visible' : 'hidden');
		$('priceDiv').style.visibility = (this.soldout ? 'hidden' : 'visible');
		$('priceDiv').style.marginLeft = ($('contentArea').offsetWidth - $('priceDiv').offsetWidth ) / 2 + 'px';
		
		if (System.Gadget.Flyout.show && System.Gadget.Flyout.document) {
			var doc = System.Gadget.Flyout.document;
			var head = doc.getElementById("head");
			var teaser = doc.getElementById("teaser");
			var desc = doc.getElementById("desc");
			var container = doc.getElementById("container");

			if (this.subtitle > "") {
				head.innerHTML = this.subtitle;
				head.style.visibility = "visible";
				head.style.display = "";
			} else {
				head.style.visibility = "hidden";
				head.style.display = "none";
			}
			teaser.innerHTML = this.teaser;
			desc.innerHTML = this.description;
			
			doc.body.style.backgroundColor           = this.backgroundColor;
			container.style.backgroundColor          = this.textareaColor;
			container.style.scrollbarFaceColor       = this.backgroundColor;
			container.style.scrollbarTrackColor      = this.textareaColor;
		}
	}
};
var Woot = function(/* list of data objects, not an array */) {
	this.sites = {};
	var order = '';
	for( var i = 0; arguments[i]; i++ ) {
		if (arguments[i].prefix) {
			this.sites[arguments[i].prefix] = arguments[i];
			order += (order ? ',' : '') + arguments[i].prefix;
		}
	}
	this.current = arguments[0];

	if( System.Gadget.Settings.read("order") == '' ) System.Gadget.Settings.write("order", order);
	if( System.Gadget.Settings.read("interval") == '' ) System.Gadget.Settings.write("interval", 30);
	if( System.Gadget.Settings.read("auto") == '' ) System.Gadget.Settings.write("auto", true);
	if( System.Gadget.Settings.read("halt") == '' ) System.Gadget.Settings.write("halt", true);
	this.applySettings();

	this.timer.reset(this);
	this.resize();
	var self = this;
	this.resizeCallback = function resizeCallback() {self.resize.apply(self)};
	this.updateCallback = function updateCallback() {self.update.apply(self)};
	this.settingsCallback = function settingsCallback() {self.applySettings.apply(self)};
};
Woot.prototype = {
	autoCycle: true,
	haltCycle: true,
	timer: {
		handle: null,
		start: function(context) {
			this.tick(context);
			this.handle = setInterval(this.tickCallback(context), this.interval);
		},
		reset: function(context) {
			clearInterval(this.handle);
			this.handle = setInterval(this.tickCallback(context), this.interval);
		},
		tickCallback: callback('tick'),
		tick: function(context) {
			if( System.Gadget.Flyout.show || !context.autoCycle || (context.current.wootoff && context.haltCycle) )
				context.update();
			else
				context.next(true);
		}
	},
	update: function() {
		if (!this.current.expires || this.current.expires <= new Date()) {
			var req = new XMLHttpRequest();
			req.data = this.current;
			req.onreadystatechange = this.connectionStateHandler;
			req.open("GET","http://api.woot.com/1/sales/current.rss/"+this.current.prefix+".woot.com");
			req.send(null);/**/
		} else {
			this.current.show();
		}
	},
	connectionStateHandler: function() {
		if (this.readyState == 4) {
			if (this.responseText == '') {
				alert('No response');
			} else {
				try {
					var xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = "false";
					xml.loadXML(this.responseText);
					this.data.link        = xml.selectSingleNode("//item/link").text;
					this.data.title       = xml.selectSingleNode("//item/title").text;
					this.data.image       = Array(
					                   xml.selectSingleNode("//woot:thumbnailimage").text,
					                   xml.selectSingleNode("//woot:standardimage").text);
					this.data.price       = xml.selectSingleNode("//woot:price").text;
					this.data.buyIt       = xml.selectSingleNode("//woot:purchaseurl").text;
					this.data.wootoff     = (xml.selectSingleNode("//woot:wootoff").text.toUpperCase() == "TRUE");
					this.data.soldout     = (xml.selectSingleNode("//woot:soldout").text.toUpperCase() == "TRUE");
					this.data.progress    = xml.selectSingleNode("//woot:soldoutpercentage").text;
					this.data.progress    = 100 - (this.data.progress * 100) + '%';
					if (this.data.soldout || this.data.progress == '100%') this.data.progress = '0';
					
					this.data.subtitle    = xml.selectSingleNode("//woot:subtitle").text;
					if (xml.selectSingleNode("//woot:teaser"))
					    this.data.teaser  = xml.selectSingleNode("//woot:teaser").text;
					else this.data.teaser = "";
					this.data.description = xml.selectSingleNode("//item/description").text;
					this.data.expires     = this.getResponseHeader("Expires");
					this.data.expires     = this.data.expires ? new Date(this.data.expires) : null;
				} catch(ex) {
					alert('Bad data. Proxy?');
				}
			}
			this.data.show();
		}
	},
	prev: function(skipTimerReset) {
		this.current = this.current.prev;
		this.update();
		if (!skipTimerReset) this.timer.reset(this);
	},
	next: function(skipTimerReset) {
		this.current = this.current.next;
		this.update();
		if (!skipTimerReset) this.timer.reset(this);
	},
	resize: function() {
		if (System.Gadget.docked) {
			with(document.body.style) width=130, height=145;
			back.src = "url(backSmall.png)";
			with($('displayArea').style) width=121, height=135, margin=4;
			$('contentArea').style.height=97;
			$('title').style.fontSize="8pt";
			$('price').style.fontSize="10pt";
			cssStyles('.light')[0].width=20;
			window.size = 0;
			$('itemImage').className = "w";
		} else {
			with(document.body.style) width=296, height=232;
			back.src = "url(backLarge.png)";
			with($('displayArea').style) width=262, height=197, margin=14;
			$('contentArea').style.height=159;
			$('title').style.fontSize="12pt";
			$('price').style.fontSize="14pt";
			cssStyles('.light')[0].width=40;
			window.size = 1;
			$('itemImage').className = "h";
		}
		$('prefix').style.left = $('logo').offsetLeft+27;
		this.current.show();
	},
	applySettings: function() {
		var order = System.Gadget.Settings.read("order").split(/,/);
		for( var i=0; order[i]; i++ ) {
			var j = order[i+1] ? i+1 : 0;
			while( order[j].match(/-/) ) j = order[j+1] ? j+1 : 0;
			this.sites[order[i].replace('-','')].next = this.sites[order[j].replace('-','')];
			this.sites[order[j].replace('-','')].prev = this.sites[order[i].replace('-','')];
			if( j > i + 1 ) i = j - 1;
		}
		this.timer.interval =
			System.Gadget.Settings.read("interval") * 1000; 
			this.timer.reset(this);
		this.autoCycle = System.Gadget.Settings.read("auto");
		this.haltCycle = System.Gadget.Settings.read("halt");
	}
}
