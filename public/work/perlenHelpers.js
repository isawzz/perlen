
//#region helpers
function perlenToArrays(b, plist) {
	let [rows, cols] = [b.rows, b.cols];
	let boardArr = new Array(rows * cols), pRemoved = [];
	for (const p of plist) {
		if (p.field == null) { pRemoved.push(p.index); delete p.col; delete p.row; }
		else boardArr[p.row * b.cols + p.col] = p.index;
	}
	return [boardArr, pRemoved];
}
function removeItemFromField(item) {
	let field = item.field;
	if (isdef(field)) {
		item.field = null;
		field.item = null;
		iDiv(item).remove;
	}
}
function collectPerlen(board) {
	let perlen = [];
	for (const f of board.fields) {
		let perle = f.item;
		if (nundef(perle)) continue;
		perlen.push(perle); perle.field = perle.row = perle.col = null;
	}
	return perlen;
}
function getRowEntries(arr, rows, cols, i) {

}
function reduceBoard(board, rNew, cNew, iModify) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	//logging!
	//let oldState = { boardArr: boardArrOld, poolArr: [], rows: rOld, cols: cOld };
	//console.log('old state:');
	//logState(oldState);
	//let perlen = collectPerlen(board);
	//console.log('perlen', perlen.map(x => x.index));

	//fieldItems = createFields(board, rNew, cNew);
	//jetzt muss ich den neuen boardArr machen!
	//row iModify aus boardArrOld muss herausgenommen werden: alle perlen zurueck zu pool!
	let rest = [];
	if (rOld > rNew) { rest = bGetRow(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	else if (cOld > cNew) { rest = bGetCol(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	//console.log('restPerlen', rest)

	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iModify) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			// else if (x == iModify) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r + 1, c] : [r, c + 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	let poolArr = G.poolArr;
	for(const x of rest){poolArr.unshift(x);}
	sendRelayout(rNew, cNew, boardArrNew, poolArr);//this.board.rows, this.board.cols, this.boardArr, this.poolArr);
}
function removeColNew(board, cClick) {
	if (board.cols<3) return;
	let iInsert = cClick;
	//console.log('remove col', cClick)
	reduceBoard(board, board.rows, board.cols - 1, iInsert);
}
function removeRowNew(board, cClick) {
	if (board.rows<3) return;
	let iInsert = cClick;
	//console.log('remove row', cClick)
	reduceBoard(board, board.rows - 1, board.cols, iInsert);
}

function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	//logging!
	//let oldState = { boardArr: boardArrOld, poolArr: [], rows: rOld, cols: cOld };
	//console.log('old state:');
	//logState(oldState);
	//let perlen = collectPerlen(board);
	//console.log('perlen', perlen.map(x => x.index));

	//fieldItems = createFields(board, rNew, cNew); //brauch ich garnicht?
	//jetzt muss ich den neuen boardArr machen!
	let rest = [];
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	sendRelayout(rNew, cNew, boardArrNew, G.poolArr);//this.board.rows, this.board.cols, this.boardArr, this.poolArr);
}
function insertColNew(board, cClick) {
	let iInsert = cClick + 1;
	console.log('insert col after', cClick)
	expandBoard(board, board.rows, board.cols + 1, iInsert);
}
function insertRowNew(board, cClick) {
	let iInsert = cClick + 1;
	console.log('insert row after', cClick)
	expandBoard(board, board.rows + 1, board.cols, iInsert);
}






function insertColNew1W(board, cClick) {
	let iInsert = cClick + 1;
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let oldState = { boardArr: boardArrOld, poolArr: [], rows: rOld, cols: cOld };
	console.log('old state:');
	logState(oldState);

	console.log('insert col after', cClick)
	let perlen = collectPerlen(board);
	console.log('perlen', perlen.map(x => x.index));
	fieldItems = createFields(board, board.rows, board.cols + 1);
	//jetzt muss ich den neuen boardArr machen!
	let [rNew, cNew, rest] = [board.rows, board.cols, []];
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			if (c < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (c == iInsert) boardArrNew[i] = null;
			else {
				let iOld = iFromRowCol(r, c - 1, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	sendRelayout(rNew, cNew, boardArrNew, G.poolArr);//this.board.rows, this.board.cols, this.boardArr, this.poolArr);
}
function insertGridColumn(board, cBefore) {
	console.log('insert col after', cBefore)
	let perlen = collectPerlen(board);
	console.log('perlen', perlen.map(x => x.index));
	fieldItems = createFields(board, board.rows, board.cols + 1);
	for (const p of perlen) {

		addItemToBoard(p, board, p.row, p.col <= cBefore ? p.col : p.col + 1);
	}
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

