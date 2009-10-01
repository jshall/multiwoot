function $(id) {return document.getElementById(id)}

function cssStyles(selector) {
	var a = [];
	for (var j in document.styleSheets) 
		if (document.styleSheets[j].rules) 
			for (var i in document.styleSheets[j].rules) 
				if (document.styleSheets[j].rules[i].selectorText) 
					if (document.styleSheets[j].rules[i].selectorText == selector)
						a[a.length] = document.styleSheets[j].rules[i].style;
	return a;
}

function callback(func) {
	return function() {
		var self = this;
		var args = arguments;
		return function() {
			self[func].apply(self, args);
		}
	}
}

if (!Object.prototype.watch) Object.prototype.watch = function () {};