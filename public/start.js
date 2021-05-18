
var STARTED = false;


function _start() {
	if (STARTED) { console.log('REENTRACE PROBLEM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); return; }
	STARTED = true;

	G = new GPerlen(dTable, 30);
	window.onkeydown = keyDownHandler;
	window.onkeyup = keyUpHandler;

	// let rect = getRect(dBoard);
	// console.log(rect)
	// let dGrid = dBoard.children[0];
	// dGrid.remove();
	// let dColumns = mDiv(null, { bg: 'green', display: 'inline-flex', w: 500, h: 20 });
	// mInsert(dBoard, dColumns)

	mBy('sidebar').ondblclick = createPerlenEditor;
	//createPerlenEditor();

}
function canAct() { return true; }

function addItemToField(item, field, dRemoved) {
	let prev = field.item;
	if (isdef(prev) && isdef(dRemoved)) {
		mAppend(dRemoved, iDiv(prev));
	}
	let dField = iDiv(field);
	item.row = field.row;
	item.col = field.col;
	item.field = field;
	field.item = item;
	mAppend(dField, iDiv(item));

}
function addItemToBoard(p, board, r, c) {
	let rows = board.rows;
	let cols = board.cols;
	if (r < 0 || r >= rows || c < 0 || c >= cols) { p.field = null; delete p.row; delete p.col; return; }
	let field = board.fields[iFromRowCol(r, c, rows, cols)];
	addItemToField(p, field, dTable);
}
function createPerle(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {

	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	return d;
}
function createPerlenAndFields(dParent, perlenItems) {
	perlenItems.map(x => x.path = mPath(x));
	//console.log(perlenItems); console.log(dParent); console.assert(dLineTableMiddle == dParent);

	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let rows = 4, cols = 5;

	mLinebreak(dParent, 25);
	for (let i = 0; i < perlenItems.length; i++) {
		let ui = createPerle(perlenItems[i], dParent, 64, 1.3, .4);
	}

	//let fieldItems = createFields1(d1, rows, cols);
	let board = { rows: rows, cols: cols, div: d1 };
	createFields(board, rows, cols);

	//let dGrid = mDiv(dTable,{bg:GREEN,w:500,h:500})
	//let grid = iGrid(5,5,dGrid,{w:50,h:50,bg:'red',gap:4}); //geht garnicht!
	//	let board = new Board2D(5,5,dTable,{w:100,h:100,bg:'white',margin:3}	);
	return [perlenItems, board];
}
function createFields(board, rows, cols, sz = 104) {
	let fieldItems = [];
	clearElement(iDiv(board));
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let h = r == 0 ? 20 : sz;
			let w = c == 0 ? 20 : sz;
			let bg = r == 0 && c == 0 ? 'transparent' : (r == 0 || c == 0) ? '#00000040' : '#ffffff60';
			let i = r * cols + c;
			let d1 = iDiv(board);
			let dItem = mDiv(d1, { display: 'inline-block', h: h, w: w, bg: bg, margin: 2 });
			mCenterCenterFlex(dItem)
			let f = { div: dItem, index: i, row: r, col: c };
			fieldItems.push(f);

			let isColumnRegulator = r == 0 && c != 0;
			let isRowRegulator = c == 0 && r != 0;
			if (isColumnRegulator) {
				dItem.onclick = (ev) => { if (ev.shiftKey) insertGridColumn(board, c); else if (ev.ctrlKey) removeGridColumn(board, c); }
			} else if (isRowRegulator) {
				dItem.onclick = (ev) => { if (ev.shiftKey) insertGridRow(board, c); else if (ev.ctrlKey) removeGridRow(board, c); }
			}
		}
	}
	board.fields = fieldItems;
	board.rows = rows;
	board.cols = cols;
	mStyleX(iDiv(board), { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, auto)` })
	return fieldItems;
}




function mPath(p) {
	let pre = './assets/games/perlen/perlen/';
	let post = '.png';
	if (isdef(p.path)) return pre + p.path + post;
	let x = p.Name.toLowerCase();
	x = replaceAll(x, "'", "");
	//x = replaceAll(x, " ", "_");
	return pre + x + post;
}
function perlenTest00() {
	console.log(Perlen, isList(Perlen))
	let p = firstCond(Perlen, x => isdef(x.path) && endsWith(x.path, 'elle'));// Perlen[1].Name;
	console.log(p);
	let name = p.name;
	console.log('name', name);
	let path = './assets/games/perlen/perlen/alles steigt aus der quelle.png';
	let x = mImg(path, dTable, { w: 100, h: 100 });
}
function collectPerlen(board) {
	let perlen = [];
	for (const f of board.fields) {
		if (isdef(f.item)) perlen.push(f.item);
	}
	return perlen;
}
function insertGridColumn(board, cBefore) {
	let perlen = collectPerlen(board);
	fieldItems = createFields(board, board.rows, board.cols + 1);
	for (const p of perlen) { addItemToBoard(p, board, p.row, p.col <= cBefore ? p.col : p.col + 1); }
	G.activateDD();
}
function insertGridRow(board, rBefore) {
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows + 1, board.cols);
	for (const p of perlen) { addItemToBoard(p, board, p.row <= rBefore ? p.row : p.row + 1, p.col); }
	G.activateDD();
}
function removeGridColumn(board, cBefore) {
	if (board.cols <= 2) return;
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows, board.cols - 1);
	for (const p of perlen) {
		addItemToBoard(p, board, p.row, p.col <= cBefore ? p.col : p.col - 1);
		let hasBeenRemoved = nundef(p.field); if (hasBeenRemoved) { mAppend(dTable, iDiv(p)); }
	}
	G.activateDD();
}
function removeGridRow(board, rBefore) {
	if (board.rows <= 2) return;
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows - 1, board.cols);
	for (const p of perlen) {
		addItemToBoard(p, board, p.row <= rBefore ? p.row : p.row - 1, p.col);
		let hasBeenRemoved = nundef(p.field); if (hasBeenRemoved) { mAppend(dTable, iDiv(p)); }
	}
	G.activateDD();
}


function createFields1(board, rows, cols) {
	let fieldItems = [];
	for (let i = 0; i < rows * cols; i++) {
		let [r, c] = iToRowCol(i, rows, cols);
		let d1 = iDiv(board);
		let dItem = mDiv(d1, { display: 'inline-block', h: 100, w: 100, bg: 'white', margin: 2 });
		mCenterCenterFlex(dItem)
		fieldItems.push({ div: dItem, index: i, row: r, col: c });
	}
	board.fields = fieldItems;
	mStyleX(iDiv(board), { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, 1fr)` })
	return fieldItems;
}
function createPerle2Broken(perle, dParent, styles) {
	let d = mDiv(dParent, { display: 'flex', 'flex-direction': 'column' });
	mCenterFlex(d);
	let x = mImg(perle.path, d, styles);
	x.onmouseenter = (ev) => { if (ev.ctrlKey) mMagnify(x, perle); }
	x.onmouseleave = () => mCancelMagnify(x, perle.path);
	let t = mText(perle.Name, d, {});
	iAdd(perle, { div: d, img: x, text: t });

}
function createPerle1W(perle, dParent, styles) {
	let x = mImg(perle.path, dParent, styles);
	x.onmouseenter = (ev) => { if (ev.ctrlKey) mMagnify(x, perle); }
	x.onmouseleave = () => mCancelMagnify(x, perle.path);
	iAdd(perle, { div: x });
	return x;
}
//overlap!!!!!!!!!!!!!
function createPerleOverlap(perle, dParent, sz = 64, wf = 1.3, hf = 0.4) {

	let d = makePerleDiv(perle, { wmin: sz + 4, h: sz * hf + 4 }, { w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 }, 'b', true);
	mAppend(dParent, d);
	return d;
}


// function enableDDImages() {
// 	var dropbox = dTable;

// 	dropbox.addEventListener('dragenter', noopHandler, false);
// 	dropbox.addEventListener('dragexit', noopHandler, false);
// 	dropbox.addEventListener('dragover', noopHandler, false);
// 	dropbox.addEventListener('drop', drop, false);

// }
// function noopHandler(evt) {
// 	evt.stopPropagation();
// 	evt.preventDefault();
// }
// function drop(evt) {
// 	evt.stopPropagation();
// 	evt.preventDefault();
// 	var imageUrl = evt.dataTransfer.getData('url');//dataTransfer.getData('url');
// 	console.log('url',imageUrl)
// 	//let img = mImg(imageUrl,dTable,{w:70,h:70});
// 	//alert(imageUrl);
// }















