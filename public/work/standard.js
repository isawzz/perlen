function applyStandard(d, s) {
	console.log('apply:', s);
	//definiere was ein standard mindestens braucht!
	let b = { boardFilename: s.boardFilename };
	let hBoard = 300, wBoard = 600;
	let scale = hBoard / valf(s.hBoard, 768);
	//let wBoard = getValueInPixel(s.wBoard,window.innerWidth)*scale;
	//console.log('s.wBoard',s.wBoard,window.innerWidth,wBoard);

	calcLayoutParameters(s, b, scale);

	let d0 = b.d0 = mDiv(d, { w: wBoard, h: hBoard, padding: 20 }); mCenterCenterFlex(d0);
	let dOuter = b.dOuter = mDiv(d0);

	// let dOuter = b.dOuter = mDiv(d, { w: wBoard, h: hBoard, bg: s.baseColor });

	loadBoardImage(d, s, b, scale);

	//=>then: loadImage,createFields
}
function grabPaletteFromImage(img) {
	let palette0 = ColorThief.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = anyColorToStandardString(pal);
		palette.push(color);
	}
	//console.log(palette)
	console.log('palette', palette)
	return palette;
}
function iToggleSingleSelection(item, items) {
	let ui = iDiv(item);
	item.isSelected = !item.isSelected;
	if (item.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(items)) {
		for (const i1 of items) {
			if (i1.isSelected && i1 != item) {
				i1.isSelected = false;
				mRemoveClass(ui, 'framedPicture');
				break;
			}
		}
	}
}
function iToggleMultipleSelection(item, items) {
	let ui = iDiv(item);
	item.isSelected = !item.isSelected;
	if (item.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');
	if (isdef(items)) {
		for (const i1 of items) {
			if (i1.isSelected) {
				console.assert(!items.includes(i1), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
				items.push(i1);
			} else {
				console.assert(items.includes(i1), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
				removeInPlace(items, i1);
			}
		}
	}
}

function iToggleSelection(isel, items) {
	if (isel.isSelected) isel.isSelected = false; iDiv(isel)
}
function mColorPicker0(dParent, palette) {
	let dPalette = mDiv(dParent, { margin: 4 }); mFlex(dPalette);
	let items = [];
	for (const c of palette) {
		dColor = mDiv(dPalette, { display: 'inline-block', w: 50, h: 50, bg: c, rounding: 4, margin: 4 });
		console.log('dColor', dColor)
		let item = { div: dColor, color: c, isSelected: false };
		items.push(item);

	}
	for (const item of items) {
		iDiv(item).onclick = () => iToggleSingleSelection(item, items);
	}
	return dPalette;
}
function loadBoardImage(dPalette, s, b, scale) {
	//aendert NICHT b.d0 size!!!
	let boardFilename = s.boardFilename;
	if (boardFilename == 'none') { return; }

	let path = getBoardImagePath(boardFilename);
	var img = mCreate('img');
	img.onload = ev => {
		let palette = grabPaletteFromImage(img);
		mColorPicker0(dPalette, palette);
		let cornerColor = isdef(s.idealBg) ? s.idealBg : getCornerPixelColor(img);
		let sz = s.naturalImageSize = { w: img.naturalWidth, h: img.naturalHeight };
		let szi = s.backgroundSize;
		if (szi == 'initial' && scale != 1) szi = getScaledSizeCss(sz, scale);
		mStyleX(b.dOuter, { w: sz.w, h: sz.h });
		b.dOuter.style.backgroundImage = `url(${img.src})`;
		mStyleX(b.dOuter, { 'background-size': szi, 'background-repeat': 'no-repeat', 'background-position': 'center center' });

		b.d0.style.background = `linear-gradient(to right, transparent 0%, ${cornerColor} 10%,${cornerColor} 90%, transparent) 100%`;
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
		console.log(centers)
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

	console.log('p', p)
	let rgb = `rgb(${p[0]},${p[1]},${p[2]})`;

	// var pos = findPos(this);	// var x = e.pageX - pos.x;	// var y = e.pageY - pos.y;//var c = this.getContext('2d');
	let x = 1, y = 1;
	var coord = "x=" + x + ", y=" + y;
	// var p = img.getImageData(x, y, 1, 1).data; 
	//var hex = anyColorToStandardString([p[0], p[1], p[2]]);
	let color = anyColorToStandardString(rgb);
	console.log('pixel', coord, 'has color', color);
	return color;
}

// function getPixelColorPalette(img) {
// 	RGBaster.colors(img, {
// 		success: function (payload) {
// 			console.log('Dominant color:', payload.dominant);
// 			console.log('Secondary color:', payload.secondary);
// 			console.log('Palette:', payload.palette);
// 		}
// 	});
// }

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








