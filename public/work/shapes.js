function mHex05(dParent, w, bg) { 
	let gap = 4;
	let whex = w - gap;
	let wcont = w;
	let hbrut = w / .866;
	let hhex = hbrut - gap;
	let hcont = hbrut * .75;
	let d = mDiv(dParent, { w: wcont, h: hcont, display: 'inline-block'}); //,'user-select': 'none' });
	
	let d1=mDiv100(d,{position:'absolute',top:-15,'z-index':-1});
	let g = asvg(d1);
	let hex1 = agShape(g, 'hex', whex, hhex, bg);
	// // hex1.style.zIndex=-100;
	// //mClass(hex1,'frameOnHover');

	// on top of that mach ich jetzt ein div element!
	let dField = mDiv100(d,{padding:'0%','z-index':100});
	let dInnerField = mDiv(dField,{w:'99%',h:'113%',bg:'blue',rounding:'50%'});

	return d;
	function asvg(dParent, sz, originInCenter = true) {
		if (!dParent.style.position) dParent.style.position = 'relative';

		let svg1 = gSvg();
		//console.log(svg1)
		svg1.setAttribute('width', '100%');
		svg1.setAttribute('height', '150%');
		let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;background:transparent';
		svg1.setAttribute('style', style);
		dParent.appendChild(svg1);

		let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		svg1.appendChild(g1);
		if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

		return g1;

	}
}
function mHex04(dParent, w, bg) { //same as mHex03
	let gap = 4;
	let whex = w - gap;
	let wcont = w;
	let hbrut = w / .866;
	let hhex = hbrut - gap;
	let hcont = hbrut * .75;
	let d = mDiv(dParent, { w: wcont, h: hcont, display: 'inline-block' });
	let g = asvg(d);
	let hex1 = agShape(g, 'hex', whex, hhex, bg);
	return d;
	function asvg(dParent, sz, originInCenter = true) {
		if (!dParent.style.position) dParent.style.position = 'relative';

		let svg1 = gSvg();
		//console.log(svg1)
		svg1.setAttribute('width', '100%');
		svg1.setAttribute('height', '150%');
		let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;background:transparent';
		svg1.setAttribute('style', style);
		dParent.appendChild(svg1);

		let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		svg1.appendChild(g1);
		if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

		return g1;

	}
}
function mHex03(dParent, w, bg) {
	let gap = 4;
	let whex = w - gap;
	let wcont = w;
	let hbrut = w / .866;
	let hhex = hbrut - gap;
	let hcont = hbrut * .75;
	let d = mDiv(dParent, { w: wcont, h: hcont, display: 'inline-block' });
	let g = asvg(d);
	let hex1 = agShape(g, 'hex', whex, hhex, bg);
	return d;
	function asvg(dParent, sz, originInCenter = true) {
		if (!dParent.style.position) dParent.style.position = 'relative';

		let svg1 = gSvg();
		//console.log(svg1)
		svg1.setAttribute('width', '100%');
		svg1.setAttribute('height', '150%');
		let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;background:transparent';
		svg1.setAttribute('style', style);
		dParent.appendChild(svg1);

		let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		svg1.appendChild(g1);
		if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

		return g1;

	}
}
function mHex02(dParent, w) {
	let gap = 4;
	let whex = w - gap;
	let wcont = w;
	let hbrut = w / .866;
	let hhex = hbrut - gap;
	let hcont = hbrut * .75;
	let d = mDiv(dParent, { w: wcont, h: hcont, display: 'inline-block' });
	let g = asvg(d);
	let hex1 = agShape(g, 'hex', whex, hhex, randomColor());
	return d;
	function asvg(dParent, sz, originInCenter = true) {
		if (!dParent.style.position) dParent.style.position = 'relative';

		let svg1 = gSvg();
		//console.log(svg1)
		svg1.setAttribute('width', '100%');
		svg1.setAttribute('height', '150%');
		let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;background:transparent';
		svg1.setAttribute('style', style);
		dParent.appendChild(svg1);

		let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		svg1.appendChild(g1);
		if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

		return g1;

	}
}

function mHexWeissNicht(dParent, styles = {}, sz = 100) {
	//let sz=200;

	let szNet = (isdef(styles.padding)) ? sz - 2 * styles.padding : sz;
	let h = sz; w = h * 0.866;
	let d = mDiv(dParent, { w: 2 * w, h: h * 1.5 });//,bg:'red'});
	let g = asvg(d);
	let hh = szNet + sz; wh = hh * 0.866;
	let colors = ['yellow', 'orange', 'red', 'green', 'violet']
	let hex1 = agShape(g, 'hex', wh, hh, chooseRandom(colors));

	if (isdef(styles)) mStyleX(d, styles)
	return d;
	// let ci1=agShape(g, 'circle', 200,150,'green'); 

}

function mHex01(dParent, styles = {}, sz = 100) {
	//let sz=200;
	let szNet = (isdef(styles.padding)) ? sz - 2 * styles.padding : sz;
	let h = sz; w = h * 0.866;
	let d = mDiv(dParent, { w: w, h: h });//,bg:'red'});
	let g = asvg(d);
	let hh = szNet + sz; wh = hh * 0.866;
	let colors = ['yellow', 'orange', 'red', 'green', 'violet']
	let hex1 = agShape(g, 'hex', wh, hh, chooseRandom(colors));

	if (isdef(styles)) mStyleX(d, styles)
	return d;
	// let ci1=agShape(g, 'circle', 200,150,'green'); 

}

function mHex00(dParent, styles, id) {
	let ui = gShape('hex', 100, 100, 'blue', 4);

	//the ui parent should be the g element under the next highest svg element
	let gParent = findAncestorElemWithParentOfType(dParent, 'svg'); // calculateTopLevelGElement(mBy(uidParent));

	gParent.appendChild(ui);
	return ui;
}
