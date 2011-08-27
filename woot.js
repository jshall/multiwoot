var wootPage = -1;
var wootPages = Array(
	Array("www.woot.com",   "#4A6751", "#355842", "wwww.png"),
	Array("shirt.woot.com", "#39648F", "#28537E", "shirt.png"),
	Array("wine.woot.com",  "#690000", "#500000", "wine.png")
);

////////////////////////////////////////////////////////////////////////////////
var refreshTimer;
var descHeaderText;
var descriptionHtml;
try { // set up the gadget's "flyout"
	System.Gadget.Flyout.file = "wootFlyout.html"; 
	System.Gadget.Flyout.onShow = showDesc; 
	System.Gadget.Flyout.onHide = hideDesc;
} catch (ex) {}
function getDetail(caller) {
	try {
		System.Gadget.Flyout.show = !System.Gadget.Flyout.show;
	} catch(ex) {
	}
}
function showDesc() {
	clearTimeout(cycleTimer);
	clearTimeout(refreshTimer);
	
	var doc = System.Gadget.Flyout.document;
	var head = doc.getElementById("head");
	var desc = doc.getElementById("desc");
	var container = doc.getElementById("container");

	doc.body.style.backgroundColor = wootPages[wootPage][1];
	container.style.scrollbarFaceColor       = wootPages[wootPage][2];
	container.style.scrollbarShadowColor     = wootPages[wootPage][1];
	container.style.scrollbarHighlightColor  = wootPages[wootPage][1];
	container.style.scrollbar3dlightColor    = wootPages[wootPage][1];
	container.style.scrollbarDarkshadowColor = wootPages[wootPage][1];
	container.style.scrollbarTrackColor      = wootPages[wootPage][1];
	container.style.scrollbarArrowColor      = wootPages[wootPage][1];
	desc.innerHTML = descriptionHtml;
	if (descHeaderText != "") {
		head.innerText = descHeaderText;
		head.style.visibility = "visible";
		head.style.display = "";
	} else {
		head.style.visibility = "hidden";
		head.style.display = "none";
	}

	refreshTimer = setTimeout("refreshDesc()",10000);
}
function refreshDesc() {
	getWootXml();
	refreshTimer = setTimeout("refreshDesc()",10000);
}
function hideDesc() {
	clearTimeout(refreshTimer);
	autoCycleWoot();
}

////////////////////////////////////////////////////////////////////////////////
var imgTag = "";
try { // assign docking events
	System.Gadget.onDock = resize;
	System.Gadget.onUndock = resize;
} catch (ex) {}
function resize() {
	var idDocked; try { // check "docked" state
		idDocked = System.Gadget.docked;
	} catch (ex) {
		idDocked = true;
	}
	// set appropriate size for docked state
	if (idDocked) {
		with(document.body.style)
			width=130,
			height=145,
			background="url(backSmall.png) no-repeat",
			margin=4;
		with(displayArea.style)
			width=121,
			height=135;
		contentArea.style.height=97;
		wootText.style.fontSize="8pt";
		wootPrice.style.fontSize="10pt";
		wootPrefix.style.left=40;
			wootOffDiv1.style.width=20;
		wootOffDiv2.style.width=20;
		imgTag = "woot:thumbnailimage"
			itemImage.className = "w";
	} else {
		with(document.body.style)
			width=296,
			height=232,
			background="url(backLarge.png) no-repeat",
			margin=14;
		with(displayArea.style)
			width=262,
			height=197;
		contentArea.style.height=159;
		wootText.style.fontSize="12pt";
		wootPrice.style.fontSize="13pt";
		wootPrefix.style.left=110;
			wootOffDiv1.style.width=40;
		wootOffDiv2.style.width=40;
		imgTag = "woot:standardimage"
			itemImage.className = "h";
	}
	getWootXml();
}

////////////////////////////////////////////////////////////////////////////////
function loadMain() {
	autoCycleWoot();
	resize();
}

////////////////////////////////////////////////////////////////////////////////
var cycleTimer;
function cycleWoot(inc) {
	wootPage = ((wootPage + inc + wootPages.length) % wootPages.length);
	getWootXml();
}
function autoCycleWoot() {
	var interval;
	if (wootOffImage1.style.visibility == 'visible') {
		interval = 10;
		getWootXml();
	} else {
		interval = 20;
		cycleWoot(1);
	}
	cycleTimer = setTimeout("autoCycleWoot();", interval * 1000);
}

////////////////////////////////////////////////////////////////////////////////
var detailTimer;
var overDetail = false;
function showDetail() {
	clearTimeout(detailTimer);
	overDetail = true;
	fadeDetail(25);
}
function hideDetail() {
	overDetail = false;
	detailTimer = setTimeout("fadeDetail(25)",500);
}
function fadeDetail(prcnt) {
	// item image back to 100% opacity and hide the text
	if (prcnt < 100) {
		if (!overDetail) {
			detailTimer = setTimeout("fadeDetail("+(prcnt+1)+")", 10);
				wootText.style.visibility = 'hidden';
		} else {
				prcnt = 25;
				wootText.style.visibility = 'visible';
		}
		itemImage.style.filter = "alpha(opacity="+prcnt+")";
	} else {
		itemImage.style.filter = "alpha(opacity=100)";
		wootText.style.visibility = 'hidden';
	}
}

////////////////////////////////////////////////////////////////////////////////
function errorHandler(errorMessage, clear) {
	if (clear) {
		wootErrorText.innerText = '';
		wootErrorText.style.visibility='hidden';
	} else {
		wootErrorText.innerText = errorMessage;
		wootErrorText.style.visibility='visible';
	}
}

////////////////////////////////////////////////////////////////////////////////
var oWootXmlDoc;
try { // create an XML document object
	oWootXmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
	oWootXmlDoc.onreadystatechange = function() {
		if (oWootXmlDoc.readyState == 1) {
			errorHandler("Loading...");
		} else if (oWootXmlDoc.readyState == 2) {
			errorHandler("Parsing...");
		} else if (oWootXmlDoc.readyState == 4) {
			// clear default texts
			wootText.innerText = "";
			wootPrice.innerText = "";
			itemImage.src = "www.png";
			wootSoldOutImage.style.visibility='hidden';
			wootPriceDiv.style.visibility='visible';
			wootOffImage1.style.visibility='hidden';
			wootOffImage2.style.visibility='hidden';
			errorHandler("Done.", true);
			
			// setup the header
			wootLogoDiv.style.backgroundColor = wootPages[wootPage][1];
			wootPrefixImage.src = wootPages[wootPage][3];
			
			// make sure the XML loaded ok
			if (oWootXmlDoc.parseError.errorCode != 0) {
				errorHandler("could not load data from "+wootPages[wootPage][0]);
			} else {
				// set the woot link
				wootLink.href = oWootXmlDoc.selectSingleNode("//link").text;
				
				// get the item node
				var oItemNode = oWootXmlDoc.selectSingleNode("//item");
				
				// go through each element
				for (var icount = 0; icount < oItemNode.childNodes.length; icount++) {
					if (oItemNode.childNodes[icount].nodeName == "title") {
						// if this is the title, update the text
						wootText.innerText = oItemNode.childNodes[icount].text;
					} else if (oItemNode.childNodes[icount].nodeName == "woot:subtitle") {
						// if this is the subtitle, update descHeaderText and the flyout
						descHeaderText = oItemNode.childNodes[icount].text;
						try {if (System.Gadget.Flyout.show) {showDesc()}} catch (ex) {}
					} else if (oItemNode.childNodes[icount].nodeName == "description") {
						// if this is the desription, update descriptionHtml and the flyout
						descriptionHtml = oItemNode.childNodes[icount].text;
						try {if (System.Gadget.Flyout.show) {showDesc()}} catch (ex) {}
					} else if (oItemNode.childNodes[icount].nodeName == imgTag) {
						// if this is the thumbnail image, update the image
						itemImage.src = oItemNode.childNodes[icount].text;
					} else if (oItemNode.childNodes[icount].nodeName == "woot:price") {
						// if this is the price, update the text
						wootPrice.innerText = oItemNode.childNodes[icount].text;
					} else if (oItemNode.childNodes[icount].nodeName == "woot:purchaseurl") {
						// if this is the woot:purchaseurl, update the link
						wootPrice.href = oItemNode.childNodes[icount].text;
					} else if (oItemNode.childNodes[icount].nodeName == "woot:soldout") {
						// if the item is sold out, adjust the sold out image and price
						if (oItemNode.childNodes[icount].text == "True") {
							wootSoldOutImage.style.visibility='visible';
							wootPriceDiv.style.visibility='hidden';
						} else {
							wootSoldOutImage.style.visibility='hidden';
							wootPriceDiv.style.visibility='visible';
						}
					} else if (oItemNode.childNodes[icount].nodeName == "woot:soldoutpercentage") {
						// adjust the woot meter
						wootMeterDiv.style.width = (oItemNode.childNodes[icount].text * 100) + '%';
					} else if (oItemNode.childNodes[icount].nodeName == "woot:wootoff") {
						// check the woot off status
						if (oItemNode.childNodes[icount].text == "True") {
							wootOffImage1.style.visibility='visible';
							wootOffImage2.style.visibility='visible';
						} else {
							wootOffImage1.style.visibility='hidden';
							wootOffImage2.style.visibility='hidden';
						}
					}
				}
			}
		}
	}
} catch (ex) {
	errorHandler("This tool was designed for IE or other MS-based engines!");
}
function getWootXml() {
	try	{
		// tell the document to load the Woot Rss XML
		oWootXmlDoc.load("http://"+wootPages[wootPage][0]+"/salerss.aspx");
		//oWootXmlDoc.load("d:\\salerss.xml");
	} catch (ex) {
		// send any exception message to error handler
		errorHandler(ex.message);
	}
}
