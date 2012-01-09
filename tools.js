function $(id) {return document.getElementById(id)}

function cssStyles(ss, selector) {
	var a = [];
	ss = ss.styleSheets;
	for (var j in ss) 
		if (ss[j].rules) 
			for (var i in ss[j].rules) 
				if (ss[j].rules[i].selectorText) 
					if (ss[j].rules[i].selectorText == selector)
						a[a.length] = ss[j].rules[i].style;
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

if( !window.System ) {
	window.System = {
		Gadget:{
			docked:true,
			Flyout:{
				show:false,
				document:null
			},
			Settings:{
				read:function(name){var tmp = this.data[name]; return (tmp ? tmp : '')},
				write:function(name, value){this.data[name] = value},
				data: {}
			}
		}
	};
}
