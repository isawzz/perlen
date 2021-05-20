function showEmptyPerlenBoard(rows, cols, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let board = { rows: rows, cols: cols, div: d1 };
	createFields(board, rows, cols);
	return board;
}

function showPerlen(pool,boardArr,poolArr,board,dParent){
	for (let i = 0; i < poolArr.length; i++) {
		let ui = createPerle(pool[poolArr[i]], dParent, 64, 1.3, .4);
	}
	for (let i = 0; i < boardArr.length; i++) {
		let iPerle = boardArr[i];
		if (iPerle == null) continue;
		let item = pool[iPerle];
		let field = board.fields[i];
		item.row = field.row;
		item.col = field.col;
		item.field = field;
		field.item = item;
		let ui = createPerle(item, iDiv(field), 64, 1.3, .4);
	}
}

function showPerlenPool(pool, poolArr, dParent) {
	for (let i = 0; i < poolArr.length; i++) {
		let ui = createPerle(pool[poolArr[i]], dParent, 64, 1.3, .4);
	}
	return poolArr;
}

function populateBoard(board, state, perlenItems) {
	//console.log('board', board);
	//wie komm ich jetzt auf die fields?
	for (let i = 0; i < state.length; i++) {
		let iPerle = state[i];
		let iField = i;
		//console.log('iPerle',iPerle,state)
		if (isNumber(iPerle)) {
			let perle = perlenItems[iPerle];
			let field = board.fields[iField];
			addItemToField(perle, field, null);
		}
	}
}

//#region helpers
function perlenToArrays(b,plist){
	let [rows,cols]=[b.rows,b.cols];
	let boardArr=new Array(rows*cols),pRemoved=[];
	for(const p of plist){
		if (p.field == null) {pRemoved.push(p.index);delete p.col;delete p.row;}
		else boardArr[p.row*b.cols+p.col]=p.index;
	}
	return [boardArr,pRemoved];
}
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
	//console.log(item,field,dField,iDiv(item))
	mAppend(dField, iDiv(item));

}
function removeItemFromField(item) {
	let field = item.field;
	if (isdef(field)) {
		item.field = null;
		field.item = null;
		iDiv(item).remove;
	}
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
				dItem.onclick = (ev) => { if (ev.shiftKey) insertGridRow(board, r); else if (ev.ctrlKey) removeGridRow(board, r); }
			}
		}
	}
	board.fields = fieldItems;
	board.rows = rows;
	board.cols = cols;
	mStyleX(iDiv(board), { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, auto)` })
	return fieldItems;
}
function collectPerlen(board) {
	let perlen = [];
	for (const f of board.fields) {
		if (isdef(f.item)) { perlen.push(f.item); f.item.field = null; }
	}
	return perlen;
}
function insertGridColumn(board, cBefore) {
	console.log('insert col after', cBefore)
	let perlen = collectPerlen(board);
	fieldItems = createFields(board, board.rows, board.cols + 1);
	for (const p of perlen) { addItemToBoard(p, board, p.row, p.col <= cBefore ? p.col : p.col + 1); }
	G.activateDD();
	G.sendRelayout(perlen);
}
function insertGridRow(board, rBefore) {
	console.log('insert row after', rBefore)
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows + 1, board.cols);
	for (const p of perlen) { addItemToBoard(p, board, p.row <= rBefore ? p.row : p.row + 1, p.col); }
	G.activateDD();
	G.sendRelayout(perlen);
}
function removeGridColumn(board, cBefore) {
	if (board.cols <= 2) return;
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows, board.cols - 1);
	for (const p of perlen) {

		if (p.col == cBefore) { p.field = null; mAppend(dTable, iDiv(p)); }
		else addItemToBoard(p, board, p.row, p.col < cBefore ? p.col : p.col - 1);
		//let hasBeenRemoved = nundef(p.field); if (hasBeenRemoved) { mAppend(dTable, iDiv(p)); }
	}
	G.activateDD();
	G.sendRelayout(perlen);
}
function removeGridRow(board, rBefore) {
	if (board.rows <= 2) return;
	let perlen = collectPerlen(board);
	let fieldItems = createFields(board, board.rows - 1, board.cols);
	for (const p of perlen) {
		if (p.row == rBefore) { p.field = null; mAppend(dTable, iDiv(p)); }
		else addItemToBoard(p, board, p.row < rBefore ? p.row : p.row - 1, p.col);

		// addItemToBoard(p, board, p.row <= rBefore ? p.row : p.row - 1, p.col);
		// let hasBeenRemoved = nundef(p.field); if (hasBeenRemoved) { mAppend(dTable, iDiv(p)); }
	}
	G.activateDD();
	G.sendRelayout(perlen);
}

