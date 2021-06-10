var VerboseSimpleClass = false;

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
function createFieldsFromCenters(dCells, clientBoard, centers, wCell, hCell, wgap, hgap, wNeeded, hNeeded) {
	let fieldItems = [];

	let i = 0;
	let dx = wCell / 2, dy = hCell / 2;
	if (nundef(wgap)) wgap = 4;
	if (nundef(hgap)) hgap = 4;

	if (nundef(wNeeded)) {
		//console.log('falle!!!')
		let r = calcMinMaxXY(centers, wCell, hCell);
		[wNeeded, hNeeded] = [r.w, r.h];
	}
	let bg = '#ffffff80';// '#00000010'; //'black';//'#00000010'
	for (const p of centers) {
		let left = p.x - dx + wgap / 2;
		let top = p.y - dy + hgap / 2;
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: wCell - wgap, h: hCell - hgap, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p }; i += 1;
		fieldItems.push(f);
	}

	clientBoard.fields = fieldItems;
	clientBoard.fieldCenters = centers;
	clientBoard.dCells = dCells;

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
function createPerleOrig(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
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
		if (isFarbPerle(perle)) {
			let bg = GermanToEnglish[perle.key];
			if (nundef(bg)) bg = perle.key;
			let d = perle.live.dImg;
			// perle.live.dLabel.remove();
			d.style.boxShadow = `0px 0px 200px 200px ${bg}`;//h-offset v-offset blur spread color
			ui.style.zIndex = 10;
		} else {
			ui.style.zIndex = 11;
		}

	}
}
function showPerlenOrig(perlenByIndex, boardArr, poolArr, board, dParent) {

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
		if (isGermanColorName(perle.key)) {
			let bg = GermanToEnglish[perle.key];
			if (nundef(bg)) bg = perle.key;
			//bg=colorTrans(bg,.5);
			let d = perle.live.dImg;
			perle.live.dLabel.remove();
			//h-offset v-offset blur spread color
			d.style.boxShadow = `0px 0px 200px 100px ${bg}`;// '100px 100px red';//`2px 2px 50px ${bg}`;
			ui.style.zIndex = 10;
			//d.style.textShadow = '10px 24px 80px 100px blue';// '100px 100px red';//`2px 2px 50px ${bg}`;
			//mStyleX(,{'text-shadow': `2px 2px 50px ${bg}`});
			//console.log('JAAAAAAAAAAAAAAAAAAAA',d);
			//let c=getColorDictColor(perle.key);
		} else {
			mStyleX(ui, { bg: 'dimgray', rounding: '50%' });
			ui.style.zIndex = 11;
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
	let path = PERLENPATH_FRONT + 'bretter/' + filename;
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










