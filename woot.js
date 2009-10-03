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
	for( var i = 0; arguments[i]; i++ ) {
		if (arguments[i].prefix) {
			this.sites[arguments[i].prefix] = arguments[i];
			alert(arguments[i].prefix);
		}
	}
	this.current = arguments[0];
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
	connectionStateHandler: function() {
		with(this) if (readyState == 4) {
			/*if ($('msg').innerText && $('msg').innerText.match(/fetch/i)) alert('');*/
			if (responseXML == null) {
				alert('No response');
			} else {
				try {
					data.link        = responseXML.selectSingleNode("//item/link").text;
					data.title       = responseXML.selectSingleNode("//item/title").text;
					data.image       = Array(
					                   responseXML.selectSingleNode("//woot:thumbnailimage").text,
					                   responseXML.selectSingleNode("//woot:standardimage").text);
					data.price       = responseXML.selectSingleNode("//woot:price").text;
					data.buyIt       = responseXML.selectSingleNode("//woot:purchaseurl").text;
					data.wootoff     = (responseXML.selectSingleNode("//woot:wootoff").text == "True");
					data.soldout     = (responseXML.selectSingleNode("//woot:soldout").text == "True");
					data.progress    = responseXML.selectSingleNode("//woot:soldoutpercentage").text;
					data.progress    = 100 - (data.progress * 100) + '%';
					if (data.soldout || data.progress == '100%') data.progress = '0';
					
					data.subtitle    = responseXML.selectSingleNode("//woot:subtitle").text;
					if (responseXML.selectSingleNode("//woot:teaser"))
					    data.teaser  = responseXML.selectSingleNode("//woot:teaser").text;
					else data.teaser = "";
					data.description = responseXML.selectSingleNode("//item/description").text;
					data.expires     = new Date(getResponseHeader("Expires"));
				} catch(ex) {
					alert('Bad data. Proxy?');
				}
			}
			
			data.show();
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
		$('prefix').style.left = $('logo').offsetLeft+27;
		this.current.show();
	},
	applySettings: function() {
		var order = System.Gadget.Settings.read("order").split(/,/);
		for( var i=0; order[i]; i++ ) {
			var j = order[i+1] ? i+1 : 0;
			while( order[j].match(/-/) ) j = order[j+1] ? j+1 : 0;
			this.sites[order[i]].next = this.sites[order[j]];
			this.sites[order[j]].prev = this.sites[order[i]];
			if( j > i + 1 ) i = j - 1;
		}
		this.timer.interval =
			System.Gadget.Settings.read("interval") * 1000; 
			this.timer.reset(this);
		this.autoCycle = System.Gadget.Settings.read("auto");
		this.haltCycle = System.Gadget.Settings.read("halt");
	}
}
