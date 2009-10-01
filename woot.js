var dimmer = {
	timer: null,
	active: false,
	low: 25,
	show: function show() {
		clearTimeout(this.timer);
		this.active = true;
		this.fade(this.low);
	},
	hide: function hide() {
		this.active = false;
		this.timer = setTimeout(this.fadeCallback(this.low), 200);
	},
	fadeCallback: callback('fade'),
	fade: function fade(prcnt) {
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
	show: function show() {
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
var Woot = function(list) {
	this.list = list;
	this.index = -1;
	this.current = list[0];
	var self = this;
	this.resizeCallback = callback('resize');
	this.updateCallback = callback('update');
	this.settingsCallback = callback('settings');
};
Woot.prototype = {
	autoCycle: true,
	haltCycle: true,
	timer: {
		interval: 5000,
		handle: null,
		start: function start() {
			this.tick();
			this.handle = setInterval(this.tickCallback(), this.interval);
		},
		reset: function reset() {
			clearInterval(this.handle);
			this.handle = setInterval(this.tickCallback(), this.interval);
		},
		tickCallback: callback('tick'),
		tick: function tick() {
			if (System.Gadget.Flyout.show || !woot.autoCycle || (woot.current.wootoff && woot.haltCycle))
				woot.update();
			else
				woot.next(true);
		}
	},
	update: function update() {
		if (!this.current.expires || this.current.expires <= new Date()) {
			//alert('Fetching ' + this.current.prefix + '.woot.com ...');
			var req = new XMLHttpRequest();
			req.data = this.current;
			req.onreadystatechange = this.connectionStateHandler;
			req.open("GET","http://"+this.current.prefix+".woot.com/salerss.aspx");
			req.send(null);/**/
		} else {
			this.current.show();
		}
	},
	connectionStateHandler: function connectionStateHandler() {
		if (this.readyState == 4) {
			/*if ($('msg').innerText && $('msg').innerText.match(/fetch/i)) alert('');*/
			var xml = this.responseXML;
			var data = this.data;
			if (xml == null) {
				alert('No response');
			} else {
				try {
					data.link        = xml.selectSingleNode("//link").text;
					data.title       = xml.selectSingleNode("//title").text;
					data.image       = Array(
						xml.selectSingleNode("//woot:thumbnailimage").text,
						xml.selectSingleNode("//woot:standardimage").text);
					data.price       = xml.selectSingleNode("//woot:price").text;
					data.buyIt       = xml.selectSingleNode("//woot:purchaseurl").text;
					data.wootoff     = (xml.selectSingleNode("//woot:wootoff").text == "True");
					data.soldout     = (xml.selectSingleNode("//woot:soldout").text == "True");
					data.progress    = xml.selectSingleNode("//woot:soldoutpercentage").text;
					data.progress    = 100 - (data.progress * 100) + '%';
					if (!data.wootoff) data.progress = '0';
					
					data.subtitle    = xml.selectSingleNode("//woot:subtitle").text;
					if (xml.selectSingleNode("//woot:teaser"))
					    data.teaser  = xml.selectSingleNode("//woot:teaser").text;
					else data.teaser = "";
					data.description = xml.selectSingleNode("//description").text;
					data.expires     = new Date(this.getResponseHeader("Expires"));
				} catch(ex) {
					alert('Bad data. Proxy?');
				}
			}
			
			data.show();
			alert('clean');
		}
	},
	go: function go(indx, skipTimerReset) {
		this.index = indx;
		this.current = this.list[this.index];
		this.update();
		var self = this;
		if (!skipTimerReset) this.timer.reset(self);
	},
	prev: function prev(skipTimerReset) {
		this.go((this.index + this.list.length - 1) % this.list.length, skipTimerReset);
	},
	next: function next(skipTimerReset) {
		this.go((this.index + 1) % this.list.length, skipTimerReset);
	},
	resize: function resize() {
		if (System.Gadget.docked) {
			with(document.body.style) width=130, height=145, margin=4,
				background="url(backSmall.png) no-repeat";
			with($('displayArea').style) width=121, height=135;
			$('contentArea').style.height=97;
			$('title').style.fontSize="8pt";
			$('price').style.fontSize="10pt";
			cssStyles('.light')[0].width=20;
			window.size = 0;
			$('itemImage').className = "w";
		} else {
			with(document.body.style) width=296, height=232, margin=14,
				background="url(backLarge.png) no-repeat";
			with($('displayArea').style) width=262, height=197;
			$('contentArea').style.height=159;
			$('title').style.fontSize="12pt";
			$('price').style.fontSize="14pt";
			cssStyles('.light')[0].width=40;
			window.size = 1;
			$('itemImage').className = "h";
		}
		$('prefix').style.left = $('logo').offsetLeft+34;
		this.current.show();
	},
	applySettings: function applySettings() {
		if (System.Gadget.Settings && System.Gadget.Settings.read("interval")) {
			this.timer.interval = System.Gadget.Settings.read("interval") * 1000;
			this.timer.reset();
			this.autoCycle = System.Gadget.Settings.read("auto");
			this.haltCycle = System.Gadget.Settings.read("halt");
		}
	}
}
