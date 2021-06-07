function applyStandard(dParent, s) {
	let b = { boardFilename: s.boardFilename };

	let hBoard = 300, wBoard = 600;
	let scale = hBoard / valf(s.hBoard, 768);

	calcLayoutParameters(s, b, scale);

	let d0 = b.d0 = mDiv(dParent, { w: wBoard + 100, h: hBoard + 100 }, 'd0_' + b.boardFilename); mCenterCenterFlex(d0);
	let dOuter = b.dOuter = mDiv(d0, {}, 'dOuter_' + b.boardFilename);

	loadBoardImage(dParent, s, b, scale);

	//=>then: loadImage,createFields
	return b;
}


function setLinearBackground(d, cInner = '#00000080', percentWide, cOuter = 'transparent') {
	if (typeof cInner == 'function') cInner = cInner();
	d.style.background = `linear-gradient(to right, ${cOuter} 0%, ${cInner} ${percentWide}%,${cInner} ${100 - percentWide}%, ${cOuter}) 100%`;
}
function loadBoardImage(dOneBoard, s, b, scale) {
	let boardFilename = s.boardFilename;
	if (boardFilename == 'none') { return; }
	let path = getBoardImagePath(boardFilename);
	var img = mCreate('img');
	img.onload = ev => {
		let cornerColor = isdef(s.idealBg) ? s.idealBg : getCornerPixelColor(img);
		let sz = s.naturalImageSize = { w: img.naturalWidth, h: img.naturalHeight };
		let szi = s.backgroundSize;
		if (szi == 'initial' && scale != 1) szi = getScaledSizeCss(sz, scale);
		b.dOuter.style.backgroundImage = `url(${img.src})`;
		mStyleX(b.dOuter, { 'background-size': szi, 'background-repeat': 'no-repeat', 'background-position': 'center center' });
		mStyleX(b.dOuter, { w: sz.w * scale, h: sz.h * scale });
		setLinearBackground(b.d0, cornerColor, 10);
		b.img = img;
	}
	img.src = path;
}


function calcLayoutParameters(s, b, scale = 1) {
	let [layout, wCell, hCell, rows, cols] = [s.boardLayout, s.wField, s.hField, s.rows, s.cols];

	let isHexLayout = startsWith(layout, 'hex');
	let hline = isHexLayout ? hCell * .75 : hCell;

	//determineRowsAndCols
	//for circle, need to determine which area of board should be covered by fields
	//this area is s.wFieldArea, s.hFieldArea
	if (nundef(rows) || layout == 'circle') rows = Math.floor(s.hFieldArea / hline);
	if (nundef(cols) || layout == 'circle') cols = Math.floor(s.wFieldArea / wCell)

	let [centers, wNeeded, hNeeded] = getCentersFromRowsCols(layout, rows, cols, wCell, hCell);

	s.nFields = centers.length;

	//console.log('layout', layout, 'wNeeded', wNeeded, 'hNeeded', hNeeded);
	//console.log('nFields', s.nFields, 'rows', rows, 'cols', cols);
	[b.nFields, b.wNeeded, b.hNeeded, b.centers] = [s.nFields, wNeeded, hNeeded, centers];
	[b.layout, b.rows, b.cols, b.wField, b.hField, b.hline] = [s.boardLayout, rows, cols, wCell, hCell, hline];

	if (scale != 1) {
		//console.log(centers)
		for (const c of centers) {
			c.x = c.x * scale;
			c.y = c.y * scale;
		}
		//centers.map(c => c.x *= scale, c.y *= scale);
		b.wNeeded *= scale;
		b.hNeeded *= scale;
		b.wField *= scale;
		b.hField *= scale;
		b.hline *= scale;
	}

	return s.nFields;
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
function setGradientImageBackground(d, path, color1 = 'red', color2 = 'green') {
	d.style.background = color1;
	d.style.backgroundImage = `url(${path})`;/* fallback */
	d.style.backgroundImage = `url(${path}), linear-gradient(${color1}, ${color2})`;
	d.style.backgroundSize = '100%';
}
function getScaledSizeCss(sz, scale) { return `${sz.w * scale}px ${sz.h * scale}px`; }

function getBoardBackgroundPicker(b){
	let palette = getPaletteFromImage(b.img);
	let picker = mColorPicker3(b.d0, palette, c => setLinearBackground(b.d0, c, 10), cornerColor);
	b.colorPicker = picker;


}






