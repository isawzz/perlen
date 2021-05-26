var VerboseSimpleClass = false;
var Schritt=0;
class SimpleClass {
	constructor() { this.dParent = dTable; }
	presentGameState(data) {

		Schritt+=1;
		let state = data.state; logState(state); copyKeys(state, this); let dParent = this.dParent;

		clearElement(dParent);

		if (isdef(state.pool)) {
			this.pool = state.pool;
			console.log('POOL IS HERE!!!',this.pool)
			this.perlenListeImSpiel = Object.values(this.pool);

			for(const idx in this.pool){let p=this.pool[idx]; p.path = mPath(p);}
		}

		this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);
		mLinebreak(dParent, 25);

		console.log('___________',Schritt,state,state.poolArr);
		showPerlen(this.pool, this.boardArr, this.poolArr, this.board, dParent);
		this.activateDD();

	}
	activateDD() {
		enableDD(this.perlenListeImSpiel, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimplest.bind(this), false, false, dragStartPreventionOnSidebarOpen);
		addDDTarget({item:this.poolArr, div: this.dParent }, false, false);
	}
	onDropPerleSimplest(source, target) {
		//console.log('dropHandler!',source,target)
		if (target.item == this.poolArr) {
			//console.log('===>perle',source,'needs to go back to pool!');
			let f=source.field;
			if (isdef(f)) sendRemovePerle(source,f);
		} else {
			let displaced = null;
			if (isdef(target.item)) {
				let p = target.item;
				if (p == source) return;
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
}

//#region perlen game start here!
function simplestPerlenGame() {
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + Username);

	let color = USERNAME_SELECTION == 'local' ? localStorage.getItem('BaseColor') : null;
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

	if (PERLEN_EDITOR_OPEN_AT_START) createPerlenEditor();

	if (!USESOCKETS) waitUntilPerlen();
	else { sendStartOrJoinPerlenGame(); }

}
function waitUntilPerlen() {
	if (nundef(PerlenDict)) { return TOMain = setTimeout(waitUntilPerlen, 200); }
	else {
		clearTimeout(TOMain)
		_start();
	}

}
function sendStartOrJoinPerlenGame() {
	if (STARTED) { console.log('REENTRACE PROBLEM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); return; }
	STARTED = true;
	let data = Username;
	logClientSend('startOrJoinPerlen', data);
	Socket.emit('startOrJoinPerlen', data);
	window.onkeydown = keyDownHandler;
	window.onkeyup = keyUpHandler;
	mBy('sidebar').ondblclick = togglePerlenEditor;
	G = new SimpleClass();
}
//skip next 2 steps!
function handleInitialPool(data) {
	logClientReceive('initialPool', data);
}
function sendInitialPool() { }

//handling socket messages for perlen game
function handleGameState(data) {
	logClientReceive('gameState', data);
	//console.log('data',data)
	G.presentGameState(data);
}
function sendMovePerle(perle, fFrom, fTo, dis) {
	//console.log('===> PLACE')
	let data = { iPerle: perle.index, iFrom: fFrom.index, iTo: fTo.index, displaced: isdef(dis) ? dis.index : null, username: Username };
	logClientSend('movePerle', data);
	Socket.emit('movePerle', data);
}
function sendRemovePerle(perle, fFrom) {
	//console.log('===> PLACE')
	let data = { iPerle: perle.index, iFrom: fFrom.index, username: Username };
	logClientSend('removePerle', data);
	Socket.emit('removePerle', data);
}
function sendPlacePerle(perle, field, dis) {
	//console.log('hallo sending move')
	let data = { iPerle: perle.index, iField: field.index, displaced: isdef(dis) ? dis.index : null, username: Username };
	logClientSend('placePerle', data);
	Socket.emit('placePerle', data);
}
function sendRelayout(rows, cols, boardArr, poolArr) {
	//console.log('hallo sending relayout');
	let data = { rows: rows, cols: cols, boardArr: boardArr, username: Username };
	if (isdef(poolArr)) data.poolArr = poolArr;
	logClientSend('relayout', data);
	Socket.emit('relayout', data);
}

//#endregion

//#region key handlers, mouse enter exit perle handlerrs
function onEnterPerle(perle) {
	if (IsControlKeyDown) {
		//if (MAGNIFIER_IMAGE) iMagnifyCancel();
		iMagnify(perle);
	}
}
function onExitPerle() { if (IsControlKeyDown) iMagnifyCancel(); }
function keyUpHandler(ev) {
	//ev.preventDefault();
	//var keyCode = ev.keyCode || ev.which;
	//console.log('keyCode',keyCode,'ev.key',ev.key);
	if (ev.key == 'Control') {
		IsControlKeyDown = false;
		iMagnifyCancel();
	}
	//else if (keyCode == 112) { show('dHelpWindow'); }
}
function keyDownHandler(ev) {

	if (IsControlKeyDown && MAGNIFIER_IMAGE) return;
	if (!MAGNIFIER_IMAGE && ev.key == 'Control') {
		IsControlKeyDown = true;
		let elements = document.querySelectorAll(":hover");
		//console.log('elements under mouse',elements);
		//check if perle is under mouse!
		for (const el of elements) {
			let id = el.id;
			if (isdef(id) && isdef(Items[id]) && Items[id].type == 'perle') {
				iMagnify(Items[id]); return;
			}

		}
	}
}

//#endregion

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
		let sBoard = toBoardString(bar, rows - 1, cols - 1);

		console.log('board', sBoard, '\npoolArr', poolArr, '\ndims', rows - 1, 'x', cols - 1);
	}
}
function showPerlen(perlenByIndex, boardArr, poolArr, board, dParent) {

	for (let i = 0; i < poolArr.length; i++) {
		let iPerle = poolArr[i];
		perle = perlenByIndex[iPerle];
		perle.field = perle.row = perle.col = null;
		let ui = createPerle(perle, dParent, 64, 1.3, .4);
	}
	for (let i = 0; i < boardArr.length; i++) {
		let iPerle = boardArr[i];
		if (iPerle == null) continue;
		let perle = perlenByIndex[iPerle];
		let field = board.fields[i];
		perle.row = field.row;
		perle.col = field.col;
		perle.field = field;
		field.item = perle;
		let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);
	}
}
function mPath(p) {
	let pre = './assets/games/perlen/perlen/';
	let post = '.png';
	if (isdef(p.path)) return p.path[0]=='.'?p.path: pre + p.path + post;
	let x = p.Name.toLowerCase();
	x = replaceAll(x, "'", "");
	//x = replaceAll(x, " ", "_");
	return pre + x + post;
}
function showEmptyPerlenBoard(rows, cols, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let board = { rows: rows, cols: cols, div: d1 };
	createFields(board, rows, cols);
	return board;
}
function dragStartPreventionOnSidebarOpen(){
	if (isdef(mBy('drop-region'))) {
		alert('please close sidebar (by DOUBLECLICK on it) before proceeding!');
		return false;
	}
	return true;
}














