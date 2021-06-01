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

	//bis hier ist alles so fuer alle spiel!
	//*** hier PerlenGame starts von Client aus!
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
	G = new SimpleClass();
	//console.log('G created');
	if (!USESOCKETS) G.presentGameState();
	// if (!USESOCKETS) G.presentGameState({
	// 	settings: DB.games.gPerlen2.settings,
	// 	state: createFakeState(),
	// });
}
//skip next 2 steps!
function handleInitialPool(data) {
	console.assert(isdef(G), 'G not defined!!!!!!!!!!!')
	//if (nundef(G.settings) && isdef(data.settings)) 
	if (isdef(data.settings) && isdef(G.settings)) copyKeys(data.settings, G.settings);
	else if (isdef(data.settings)) G.settings = data.settings;
	else if (isdef(G.settings)) G.settings.individualSelection = true;
	else if (nundef(data.settings) && nundef(G.settings)) G.settings = { individualSelection: true };
	G.initialPoolSelected = false;
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
	if (ev.key == 'Alt' && isdef(Socket)) { Socket.emit('hide', { username: Username }); }
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
	if (ev.key == 'Alt' && isdef(Socket)) { Socket.emit('show', { username: Username }); }

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
function createFieldsFromCenters(clientBoard, centers, wCell, hCell, wgap,hgap, wNeeded, hNeeded) {
	let fieldItems = [];
	let d1 = iDiv(clientBoard);
	let rect = getRect(d1);

	//console.log('rect', rect)

	let dCells = mDiv(d1);//,{bg:'blue'});
	//mCenterCenterFlex(d1)

	let i = 0;
	let dx = wCell / 2, dy = hCell / 2;
	if (nundef(wgap)) wgap = 4;
	if (nundef(hgap)) hgap = 4;

	if (nundef(wNeeded)) {
		//console.log('falle!!!')
		let r = calcMinMaxXY(centers, wCell, hCell);
		[wNeeded, hNeeded] = [r.w, r.h];
	}
	//console.log('wNeeded,hNeeded',wNeeded,hNeeded)
	let bg = '#ffffff80';// '#00000010'; //'black';//'#00000010'
	for (const p of centers) {
		// let sz = 90;
		let left=p.x - dx + wgap / 2;
		let top=p.y - dy + hgap / 2;
		//console.log('left',left,'top',top, p, dx,dy,wgap,hgap,wNeeded,hNeeded)
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: wCell - wgap, h: hCell - hgap, rounding: '50%', bg: bg });
		//console.log(dItem)
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p }; i += 1;
		fieldItems.push(f);
	}

	clientBoard.fields = fieldItems;
	clientBoard.fieldCenters = centers;
	clientBoard.dCells = dCells;

	// mStyleX(dCells, { position:'absolute',left: 100, top: 100, w: wNeeded, h: hNeeded, bg: 'blue' });
	mStyleX(dCells, { position:'absolute',left: (rect.w - wNeeded) / 2, top: (rect.h - hNeeded) / 2, w: wNeeded, h: hNeeded});
	// mStyleX(dCells, { maleft: (rect.w - wNeeded) / 2, matop: (rect.h - hNeeded) / 2, bg: 'blue' });

	return fieldItems;
}
function doBoardRelayout(board, c, func, isReduction) {
	if (func == removeColNew && board.cols < 3 || func == removeRowNew && board.rows < 3) return;
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

	//console.log('perlenByIndex',perlenByIndex)
	//console.log('boardArr',boardArr);
	for (let i = 0; i < poolArr.length; i++) {
		let iPerle = poolArr[i];
		//console.log('iPerle',iPerle);
		perle = perlenByIndex[iPerle];
		//console.log('perle',perle)
		perle.field = null;
		let ui = createPerle(perle, dParent, 64, 1.3, .4);
	}
	for (let i = 0; i < boardArr.length; i++) {
		let iPerle = boardArr[i];
		if (iPerle == null) continue;
		let perle = perlenByIndex[iPerle];
		//console.log('perle auf dem board',perle)
		let field = board.fields[i];
		perle.field = field;
		field.item = perle;
		let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);
		//perle.key='gelb';
		if (isGermanColorName(perle.key)){
			let bg=GermanToEnglish[perle.key];
			if (nundef(bg)) bg=perle.key;
			//bg=colorTrans(bg,.5);
			let d=perle.live.dImg;
			perle.live.dLabel.remove();
			//h-offset v-offset blur spread color
			d.style.boxShadow = `0px 0px 200px 100px ${bg}`;// '100px 100px red';//`2px 2px 50px ${bg}`;
			ui.style.zIndex=10;
			//d.style.textShadow = '10px 24px 80px 100px blue';// '100px 100px red';//`2px 2px 50px ${bg}`;
			//mStyleX(,{'text-shadow': `2px 2px 50px ${bg}`});
			//console.log('JAAAAAAAAAAAAAAAAAAAA',d);
			//let c=getColorDictColor(perle.key);
		}else{
			mStyleX(ui,{bg:'dimgray',rounding:'50%'});
			ui.style.zIndex=11;
		}
		
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
function calcMinMaxXY(centers, wCell, hCell) {
	let minx = 1000000, maxx = 0, miny = 1000000, maxy = 0, dx = wCell / 2, dy = hCell / 2;
	for (const c of centers) {
		if (c.x - dx < minx) minx = c.x - dx; else if (c.x + dx > maxx) maxx = c.x + dx;
		if (c.y - dy < miny) miny = c.y - dy; else if (c.y + dy > maxy) maxy = c.y + dy;
	}
	return { x: minx, y: miny, w: maxx - minx, h: maxy - miny };
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












