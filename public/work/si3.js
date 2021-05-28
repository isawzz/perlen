var VerboseSimpleClass = false;

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
	sendStartOrJoinPerlenGame();
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
	G = new SimpleClass2();
}
//skip next 2 steps!
function handleInitialPool(data) {
	console.assert(isdef(G),'G not defined!!!!!!!!!!!')
	//if (nundef(G.settings) && isdef(data.settings)) 
	if (isdef(data.settings) && isdef(G.settings)) copyKeys(data.settings,G.settings);
	else if (isdef(data.settings)) G.settings = data.settings;
	else if (isdef(G.settings)) G.settings.SkipInitialSelect = false;
	else if (nundef(data.settings) && nundef(G.settings)) G.settings={SkipInitialSelect:false};
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',data,G)
	//SkipInitialSelect = false;
	initToolbar(G.settings);
	G.INITIAL_POOL_DONE = false;
	logClientReceive('initialPool', data);
	setTitle(data.instruction);
	G.presentGameState(data);
	createPerlenEditor();

}
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
				dItem.onclick = (ev) => {
					if (ev.shiftKey) doBoardRelayout(board, c, insertColNew, false);//insertColNew(board,c); //boardRelayout(board,c,insertColNew); 
					else if (ev.ctrlKey) doBoardRelayout(board, c, removeColNew, true);//removeColNew(board, c); 
				};
			} else if (isRowRegulator) {
				dItem.onclick = (ev) => {
					if (ev.shiftKey) doBoardRelayout(board, r, insertRowNew, false); //insertRowNew(board, r); 
					else if (ev.ctrlKey) doBoardRelayout(board, r, removeRowNew, true); //removeRowNew(board, r); 
				};
			}
		}
	}
	board.fields = fieldItems;
	board.rows = rows;
	board.cols = cols;
	mStyleX(iDiv(board), { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, auto)` })
	return fieldItems;
}
function doBoardRelayout(board, c, func, isReduction) {
	if (func == removeColNew && board.cols < 3 || func == removeRowNew && board.rows<3) return;
	let result = func(board, c);
	//console.log('result von relayout:', result);
	let poolArr = G.state.poolArr;
	if (isReduction) {
		for (const x of result.extras) { poolArr.unshift(x); }
	}

	sendRelayout(result.rows, result.cols, result.boardArr, poolArr);//this.board.rows, this.board.cols, this.boardArr, this.poolArr);

}
function createPerle(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	return d;
}
function dragStartPreventionOnSidebarOpen() {
	if (isdef(mBy('drop-region'))) {
		alert('please close sidebar (by DOUBLECLICK on it) before proceeding!');
		return false;
	}
	return true;
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
function mPath(p) {
	let pre = './assets/games/perlen/perlen/';
	let post = '.png';
	if (isdef(p.path)) return p.path[0] == '.' ? p.path : pre + p.path + post;
	let x = p.Name.toLowerCase();
	x = replaceAll(x, "'", "");
	//x = replaceAll(x, " ", "_");
	return pre + x + post;
}
function showPerlen(perlenByIndex, boardArr, poolArr, board, dParent) {

	//console.log('boardArr',boardArr);
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
function quadBoard(rows, cols, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let board = { rows: rows, cols: cols, div: d1 };
	createFields(board, rows, cols);
	return board;
}
function showBrettBoard(filename, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let path = './assets/games/perlen/bretter/' + filename;
	let d1 = mDiv(dp, { display: 'inline-block', position: 'relative' });//,'background-image':path });
	let img = mImg(path, d1);
	let board = { img: img, div: d1 };

	let centers = littleHexBoardTool(); // startsWith(filename, 'brett02') ? littleHexBoardTool() : null;
	//console.log('centers', centers);

	if (centers) createFieldsFromCenters(board, centers, 90);
	// for (const p of centers) {
	// 	let sz = 90;
	// 	let dx = dy = sz / 2;
	// 	let bg = '#00000010'; //'black';//'#00000010'
	// 	let f = mDiv(d1, { position: 'absolute', left: p.x - dx, top: p.y - dy, display: 'inline', h: sz, w: sz, rounding: '50%', bg: bg });
	// }

	return board;
}
function createFieldsFromCenters(board, centers, sz = 90) {
	let fieldItems = [];
	let d1 = iDiv(board);

	let i = 0;
	for (const p of centers) {
		// let sz = 90;
		let dx = dy = sz / 2;
		dy -= 12;
		let bg = '#00000010'; //'black';//'#00000010'
		let dItem = mDiv(d1, { position: 'absolute', left: p.x - dx, top: p.y - dy, display: 'inline', h: sz, w: sz, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p }; i += 1;
		fieldItems.push(f);
	}

	board.fields = fieldItems;
	board.fieldCenters = centers;
	return fieldItems;
}

function littleHexBoardTool(p1, p2, p3) {
	p1 = { x: 282, y: 72 };
	p2 = { x: 484, y: 72 };
	p3 = { x: 282, y: 422 };

	let centers = [];
	let row1x = [p1.x, (p1.x + p2.x) / 2, p2.x];
	let row1y = [p1.y, p1.y, p1.y];
	let dxh = (row1x[1] - row1x[0]) / 2;
	let dx = dxh * 2;
	let dy = (p3.y - p1.y) / 2;
	let dyh = dy / 2;
	let row2x = [p1.x - dxh, p1.x + dxh, p2.x - dxh, p2.x + dxh];
	let y = p1.y + dyh;
	let row2y = [y, y, y, y];
	//let row2x = [p1.x - dxh, p1.x + dxh, p3.x - dxh, p3.x + dxh];
	y += dyh;
	let [x1, x3] = [p1.x, p2.x];
	let row3x = [x1 - dx, x1, x1 + dx, x3, x3 + dx];
	let row3y = [y, y, y, y, y];
	let row4x = row2x;
	let row5x = row1x;

	let rowsX = [row1x, row2x, row3x, row4x, row5x];
	let centersX = [];
	for (const r of rowsX) {
		for (const x of r) {
			centersX.push(x);
		}
	}
	//console.log('centersX', centersX);
	let i = 0;
	let centersY = [];
	let yStart = p1.y;
	let yInc = dyh;
	y = yStart;
	for (colcount of [3, 4, 5, 4, 3]) {
		for (let c = 0; c < colcount; c++)		centersY.push(y);
		y += yInc;
	}

	//finally, zip centersX and centersY
	for (let i = 0; i < centersX.length; i++) centers.push({ x: centersX[i], y: centersY[i] });

	//auessere felder dazu!
	dx += 0;
	let xVor = centersX[7] - dx;
	let xNach = centersX[11] + dx;
	y = yStart;// = [yStart,yStart+yInc*1.25,yStart+yInc*1.5,yStart+yInc*4];
	for (let i = 0; i < 5; i++) {
		if (i % 2 == 0) { centers.push({ x: xVor, y: y }); centers.push({ x: xNach, y: y }); }
		y += yInc;
	}


	return centers;
}












