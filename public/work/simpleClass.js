var VerboseSimpleClass = false;
class SimpleClass {
	constructor() { this.dParent = dTable; }
	presentGameState(data) {

		let state = data.state; logState(state); copyKeys(state, this); let dParent = this.dParent;

		clearElement(dParent);

		if (isdef(state.pool)) {
			this.pool = state.pool;
			this.pool.map(x => x.path = mPath(x));
		}

		this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);
		mLinebreak(dParent, 25);

		showPerlen(this.pool, this.boardArr, this.poolArr, this.board, dParent);
		this.activateDD();

	}
	activateDD() {
		enableDD(this.pool, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimplest.bind(this), false);
	}
	onDropPerleSimplest(source, target) {
		let displaced = null;
		if (isdef(target.item)) {
			let p = target.item;
			displaced = p;
		}
		if (isdef(source.field)) {
			let f = source.field;
			sendMovePerle(source, f, target, displaced);
		} else {
			sendPlacePerle(source, target, displaced);
		}

	}
}
function boardArrReduced(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);

			res.push(boardArr[i]);
		}
	}
	return res;

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
				dItem.onclick = (ev) => { if (ev.shiftKey) insertColNew(board, c); else if (ev.ctrlKey) removeColNew(board, c); }
			} else if (isRowRegulator) {
				dItem.onclick = (ev) => { if (ev.shiftKey) insertRowNew(board, r); else if (ev.ctrlKey) removeRowNew(board, r); }
			}
		}
	}
	board.fields = fieldItems;
	board.rows = rows;
	board.cols = cols;
	mStyleX(iDiv(board), { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, auto)` })
	return fieldItems;
}
function createPerle(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	return d;
}
function logState(state) {
	if (VerboseSimpleClass) {
		console.log('___________'); 
		let [rows, cols, boardArr, poolArr] = [state.rows, state.cols, state.boardArr, state.poolArr];
		let bar = boardArrReduced(boardArr, rows, cols);
		let sBoard = toBoardString(bar, rows-1, cols-1);

		console.log('board', sBoard, '\npoolArr', poolArr, '\ndims', rows - 1, 'x', cols - 1);
	}
}
function showPerlen(pool, boardArr, poolArr, board, dParent) {
	for (let i = 0; i < poolArr.length; i++) {
		let iPerle = poolArr[i];
		perle = pool[iPerle];
		perle.field = perle.row = perle.col = null;
		let ui = createPerle(perle, dParent, 64, 1.3, .4);
	}
	for (let i = 0; i < boardArr.length; i++) {
		let iPerle = boardArr[i];
		if (iPerle == null) continue;
		let perle = pool[iPerle];
		let field = board.fields[i];
		perle.row = field.row;
		perle.col = field.col;
		perle.field = field;
		field.item = perle;
		let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);
	}
}
function showEmptyPerlenBoard(rows, cols, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let board = { rows: rows, cols: cols, div: d1 };
	createFields(board, rows, cols);
	return board;
}

