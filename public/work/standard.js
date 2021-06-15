function applySettings(b, s, h=768, topFrame = 0) {
	let isRealBoard = topFrame == 0;
	let hBoard = h, wBoard = 2 * h;
	let scale = hBoard / valf(s.hBoard, 768);
	calcLayoutParameters(s, b, scale);
	clearElement(b.dOuter);
	b.fields = null;
	createFields(s, b, scale);
	console.log('applySettings: baseColor',s.baseColor);
	if (isRealBoard) setNewBackgroundColor(s.baseColor);
	//console.log('b.fields',b.fields)
	return b;
}
function isField(x){return x.isField == true;}
function applyStandard(dParent, s, h = 768, topFrame = 0) {
	let isRealBoard = topFrame == 0;
	let b = { boardFilename: s.boardFilename };
	let hBoard = h, wBoard = 2 * h;
	let scale = hBoard / valf(s.hBoard, 768);
	calcLayoutParameters(s, b, scale);
	let d0;
	if (isRealBoard){
		//console.log('hallo!!!!!!!')
		d0 = b.d0 = mDiv(dParent, { h: hBoard }); 
	}else{
		//console.log('NEIN!!!!!!!!!!')
		d0 = b.d0 = mDiv(dParent, { w: wBoard + 100, h: hBoard + topFrame }, 'd0_' + b.boardFilename); 
	}
	mCenterCenterFlex(d0);
	let dOuter = b.dOuter = mDiv(d0, {}, 'dOuter_' + b.boardFilename);
	mCenterCenterFlex(dOuter);
	loadBoardImage(dParent, s, b, scale, topFrame != 0);
	// console.log('applyStandard: isRealBoard',isRealBoard,'board',s.boardFilename,'baseColor',s.baseColor,'field color',s.fieldColor);
	console.log('applyStandard: baseColor',s.baseColor);
	if (isRealBoard) setNewBackgroundColor(s.baseColor);
	createFields(s, b, scale);
	//console.log('b.fields',b.fields)
	return b;
}
function calcLayoutParameters(s, b, scale = 1) {
	let [layout, horDist, vertDist, rows, cols] = [s.boardLayout, s.dxCenter, s.dyCenter, s.rows, s.cols];

	let isHexLayout = startsWith(layout, 'hex');
	let hline = isHexLayout ? vertDist * .75 : vertDist;

	//determineRowsAndCols
	//for circle, need to determine which area of board should be covered by fields
	//this area is s.wFieldArea, s.hFieldArea
	if (nundef(rows) || layout == 'circle') rows = Math.floor(s.hFieldArea / hline);
	if (nundef(cols) || layout == 'circle') cols = Math.floor(s.wFieldArea / horDist)

	let [centers, wNeeded, hNeeded] = getCentersFromRowsCols(layout, rows, cols, horDist, vertDist);

	s.nFields = centers.length; //JA!

	//console.log('layout', layout, 'wNeeded', wNeeded, 'hNeeded', hNeeded);
	//console.log('nFields', s.nFields, 'rows', rows, 'cols', cols);
	[b.nFields, b.wNeeded, b.hNeeded, b.centers] = [s.nFields, wNeeded, hNeeded, centers];
	[b.layout, b.rows, b.cols, b.dxCenter, b.dyCenter, b.hline] = [s.boardLayout, rows, cols, horDist, vertDist, hline];

	if (scale != 1) {
		//console.log(centers)
		for (const c of centers) {
			c.x = c.x * scale;
			c.y = c.y * scale;
		}
		//centers.map(c => c.x *= scale, c.y *= scale);
		b.wNeeded *= scale;
		b.hNeeded *= scale;
		b.dxCenter *= scale;
		b.dyCenter *= scale;
		b.hline *= scale;
	}

	return s.nFields;
}
function createFields(s, b, scale) {
	let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop * scale, maleft: s.boardMarginLeft * scale, w: b.wNeeded, h: b.hNeeded, position: 'relative' },'dFieldArea'); //, bg: 'green' });

	// if (!HEROKU && scale == 1) {makeCanvas(dCells);s.fieldColor = 'transparent';}

	let [horDist, vertDist, szField] = [b.dxCenter, b.dyCenter, s.szField*scale];
	let fields = b.fields = [], i = 0, dx = horDist / 2, dy = vertDist / 2;
	let bg = s.fieldColor;
	for (const p of b.centers) {
		let left = p.x - szField/2;
		let top = p.y - szField/2;
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: szField, h: szField, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p, isField: true }; i += 1;
		fields.push(f);
	}
	if (s.boardRotation != 0) { dCells.style.transform = `rotate(${s.boardRotation}deg)`; }
}
function createFields_dep(s, b, scale) {
	let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop * scale, maleft: s.boardMarginLeft * scale, w: b.wNeeded, h: b.hNeeded, position: 'relative' }); //, bg: 'green' });
	let [wCell, hCell, wGap, hGap] = [b.dxCenter, b.dyCenter, s.wGap * scale, s.hGap * scale];
	let fields = b.fields = [], i = 0, dx = wCell / 2, dy = hCell / 2;
	let bg = s.fieldColor;
	for (const p of b.centers) {
		let left = p.x - dx + wGap / 2;
		let top = p.y - dy + hGap / 2;
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: wCell - wGap, h: hCell - hGap, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p, isField: true }; i += 1;
		fields.push(f);
	}
	if (s.boardRotation != 0) { dCells.style.transform = `rotate(${s.boardRotation}deg)`; }
}
function getRandomPixelColor(img) {

	let canvas = mCreate('canvas');
	let ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	let [rx, ry] = [randomNumber(1, 100), randomNumber(1, 50)];
	//[rx,ry]=[250,100];
	console.log('______________', rx, ry)
	var p = ctx.getImageData(rx, ry, 1, 1).data;

	console.log('p', p)
	let rgb = `rgb(${p[0]},${p[1]},${p[2]})`;

	// var pos = findPos(this);	// var x = e.pageX - pos.x;	// var y = e.pageY - pos.y;//var c = this.getContext('2d');
	let x = rx, y = ry;
	var coord = "x=" + x + ", y=" + y;
	// var p = img.getImageData(x, y, 1, 1).data; 
	//var hex = anyColorToStandardString([p[0], p[1], p[2]]);
	let color = anyColorToStandardString(rgb);
	console.log('pixel', coord, 'has color', color);
	return color;
}
function getCornerPixelColor(img) {

	let canvas = mCreate('canvas');
	let ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	var p = ctx.getImageData(1, 1, 1, 1).data;

	//console.log('p', p)
	let rgb = `rgb(${p[0]},${p[1]},${p[2]})`;

	// var pos = findPos(this);	// var x = e.pageX - pos.x;	// var y = e.pageY - pos.y;//var c = this.getContext('2d');
	let x = 1, y = 1;
	var coord = "x=" + x + ", y=" + y;
	// var p = img.getImageData(x, y, 1, 1).data; 
	//var hex = anyColorToStandardString([p[0], p[1], p[2]]);
	let color = anyColorToStandardString(rgb);
	//console.log('pixel', coord, 'has color', color);
	return color;
}
function getValueInPixel(val, relto) {
	if (isNumber(val)) return val;
	val = firstNumber(val);
	return val * relto / 100;
}
function getBoardImagePath(boardFilename) {
	console.assert(boardFilename.includes('.'), 'getImagePath: not a filename!!!', boardFilename)
	return PERLENPATH_FRONT + 'bretter/' + boardFilename;
}
function getScaledSizeCss(sz, scale) { return `${sz.w * scale}px ${sz.h * scale}px`; }

function getBoardBackgroundPicker(b) {
	let palette = getPaletteFromImage(b.img);
	let picker = mColorPicker3(b.d0, palette, c => setLinearBackground(b.d0, c, 10), cornerColor);
	b.colorPicker = picker;


}
function loadBoardImage(dOneBoard, s, b, scale, useCornerColor=false) {
	let boardFilename = s.boardFilename;
	if (boardFilename == 'none') { return; }

	let path = getBoardImagePath(boardFilename);
	var img = mCreate('img');
	img.onload = ev => {

//		let cornerColor = isdef(s.idealBg) ? s.idealBg : getCornerPixelColor(img);

		let sz = s.naturalImageSize = b.imgSize = { w: img.naturalWidth, h: img.naturalHeight };
		let szi = s.backgroundSize;
		if (szi == 'initial' && scale != 1) szi = getScaledSizeCss(sz, scale);
		b.dOuter.style.backgroundImage = `url(${img.src})`;
		mStyleX(b.dOuter, { 'background-size': szi, 'background-repeat': 'no-repeat', 'background-position': 'center center' });
		let [wb, hb] = [Math.max(sz.w * scale, b.wNeeded), Math.max(sz.h * scale, b.hNeeded)];
		mStyleX(b.dOuter, { wmin: wb, hmin: hb });
		if (useCornerColor) setLinearBackground(b.d0, s.baseColor, 10);
		b.img = img;
	}
	img.src = path;

}
function setGradientImageBackground(d, path, color1 = 'red', color2 = 'green') {
	d.style.background = color1;
	d.style.backgroundImage = `url(${path})`;/* fallback */
	d.style.backgroundImage = `url(${path}), linear-gradient(${color1}, ${color2})`;
	d.style.backgroundSize = '100%';
}
function setLinearBackground(d, cInner = '#00000080', percentWide, cOuter = 'transparent') {
	if (typeof cInner == 'function') cInner = cInner();
	d.style.background = `linear-gradient(to right, ${cOuter} 0%, ${cInner} ${percentWide}%,${cInner} ${100 - percentWide}%, ${cOuter}) 100%`;
}




