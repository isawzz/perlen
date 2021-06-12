var StepCounter = 0;

class SimpleClass7 {
	constructor() {
		this.dParent = dTable;
		this.initialPoolSelected = false;
		this.settings = {};
		openToolbar();

		//this.sheet=new BlankSheet(Socket,mBy('sheet'));
	}
	presentGameState(data) {

		//setTimeout(		onClickEditLayout,200		);
		//console.log('kkkkkkk',1 !== true, isNumber(true),true===1);



		console.log('_________________________gs', StepCounter); StepCounter += 1;

		mStyleX(dTable, { h: window.innerHeight });

		let [settings, state] = this.processData(data);

		console.assert(state.poolArr.map(x => !isList(x)), 'BUGBUGBUGBUGBUGBUGBUG!!!')

		//if (settings == Settings.o && Settings.o == this.settings) console.log('...settings ok'); else console.assert(settings == Settings && Settings == this.settings, 'hallo settings FALSCH!!!!!!!!!!!!!')
		let needToLoadBoard = nundef(this.clientBoard) || this.clientBoard.boardFilename != settings.boardFilename;

		// *** jetzt sind settings,state,perleDict,pool,needToLoadBoard up-to-date ***

		if (needToLoadBoard) {
			clearElement(this.dParent); this.dPool = null;
			this.clientBoard = applyStandard(this.dParent, this.settings);
			if (!this.inSyncWithServer()) return; //else console.log('...sync ok!');
		}
		if (nundef(this.dPool)) {
			mLinebreak(this.dParent, 30);
			let dPool = this.dPool = mDiv(this.dParent);
		} else {
			//console.log('...sync ok (no board)');
			this.clearBoardUI();
			this.clearPoolUI();
		}
		this.presentPerlen();
		this.activateDD();
	}
	chooseBoard(boardFilename) {
		if (boardFilename == this.settings.boardFilename) return;
		Socket.emit('chooseBoard', { boardFilename: boardFilename });
	}
	createFields() {
		let [b, s] = [this.clientBoard, this.settings];
		let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop, maleft: s.boardMarginLeft, w: b.wNeeded, h: b.hNeeded, position: 'relative' }); //, bg: 'green' });

		let [wCell, hCell, wGap, hGap] = [s.dxCenter, s.dyCenter, s.wGap, s.hGap];
		//console.log(wCell, hCell);
		let fields = b.fields = [], i = 0, dx = wCell / 2, dy = hCell / 2;
		let bg = s.fieldColor;
		for (const p of b.centers) {
			let left = p.x - dx + wGap / 2;
			let top = p.y - dy + hGap / 2;
			let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: wCell - wGap, h: hCell - hGap, rounding: '50%', bg: bg });
			mCenterCenterFlex(dItem)
			let f = { div: dItem, index: i, center: p }; i += 1;
			fields.push(f);
		}
		if (s.boardRotation != 0) { dCells.style.transform = `rotate(${s.boardRotation}deg)`; }
	}
	clearBoardUI() {
		let b = this.clientBoard;
		let [perlen, fields] = [[], []];
		for (const f of b.fields) {

			let p = f.item;
			if (isList(p)) { //BUG!!!!!! WORK AROUND
				//console.log(f);
				//console.log(p);
				continue;
			}
			if (isdef(p)) {
				//console.log('removing',p,iDiv(p))
				if (isdef(p.dxy)) { this.resetCenter(f); }
				iDiv(p).remove();
				f.item = null;
				perlen.push(p);
				fields.push(f);
			}
		}
		return [perlen, fields];
	}
	clearBoard() {
		let [perlen, fields] = this.clearBoardUI();
		console.log('sending remove all perlen command', perlen, fields);
		sendRemovePerlen(perlen, fields);
	}
	clearPoolUI() { clearElement(this.dPool); }
	presentPerlen() {
		let [b, s, perlenByIndex, boardArr, poolArr] = [this.clientBoard, this.settings, this.poolEnriched, this.state.boardArr, this.state.poolArr];

		let dParent = this.dPool;
		for (let i = 0; i < poolArr.length; i++) {
			let iPerle = poolArr[i]; //console.log('iPerle', iPerle, perlenByIndex, perlenByIndex[iPerle]);
			console.assert(!isList(iPerle), 'BUGBUGBUGBUGBUG!!!!!!')
			let perle = perlenByIndex[iPerle]; //console.log('perle', perle)
			if (nundef(perle)) {
				//BUGBUGBUG

				console.log('BUG!',perlenByIndex, perlenByIndex, 'perlenDict', this.perlenDict, '\nboardArr', boardArr, '\npoolArr', poolArr)
			}
			perle.field = null;
			let ui = createPerle(perle, dParent, 64, 1.3, .4);
		}
		for (let i = 0; i < boardArr.length; i++) {
			let pin = boardArr[i];
			let iPerle = isList(pin) ? pin[0] : pin; //
			if (iPerle == null) continue;
			let perle = perlenByIndex[iPerle]; //console.log('perle auf dem board', perle)
			let field = b.fields[i];
			perle.field = field;
			field.item = perle;
			let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);


			if (isList(pin)) {
				//console.log('got move info', pin)
				this.moveCenter(field, perle, pin[1], pin[2]);
			}
			//perle.key='gelb';
			if (isFarbPerle(perle)) {
				let bg = GermanToEnglish[perle.key];
				if (nundef(bg)) bg = perle.key;
				let d = perle.live.dImg;
				d.style.boxShadow = `0px 0px 200px 200px ${bg}`;//h-offset v-offset blur spread color
				ui.style.zIndex = 10;
			} else {
				ui.style.zIndex = 11;
			}

		}
	}
	activateDD() {
		let fields = this.clientBoard.fields;
		//console.log('fields',fields)
		enableDD(this.perlenListeImSpiel, fields.map(x => x), this.onDropPerleSimplest.bind(this), false, false, dragStartPreventionOnSidebarOpen);
		addDDTarget({ item: this.state.poolArr, div: this.dParent }, false, false);
	}
	onDropOrig(source, target) {
		//console.log('dropHandler!',source,'\ntarget',target)
		if (target.item == this.state.poolArr) {
			//console.log('===>perle',source,'needs to go back to pool!');
			let f = source.field;
			if (isdef(f)) sendRemovePerle(source, f);
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
				//console.log('sending place ')
				sendPlacePerle(source, target, displaced);
			}
		}
	}
	onDropPerleSimplest(source, target, isCopy, clearTarget, dx, dy, ev, clone) {
		//console.log('freeForm?',this.settings.freeForm)
		if (!this.settings.freeForm) {
			this.onDropOrig(source, target);
		} else if (target.item == this.state.poolArr) {
			//console.log('===>perle',source,'needs to go back to pool!');
			let f = source.field;
			if (isdef(f)) sendRemovePerle(source, f);
		} else {
			this.onDropFreeForm(source, target, ev, clone);
		}
	}
	onDropFreeForm(source, target, ev, clone) {

		let perle = source;
		let dField = iDiv(target);
		let dPerle = iDiv(source);
		let rField = getRect(dField);
		let rPerle = getRect(dPerle);
		////let rPerle = getRect(iDiv(source))
		//console.log('rect of field',rField);
		//console.log('ev',ev);
		//console.log('DDInfo.dragOffset',DDInfo.dragOffset);
		let d = iDiv(perle);
		let drop = { x: ev.clientX, y: ev.clientY };
		let [dx, dy] = [DDInfo.dragOffset.offsetX, DDInfo.dragOffset.offsetY];
		let [x, y, w, h] = [drop.x, drop.y, rField.w, rField.h];
		// //let d1=mDiv(dTable,{position:'fixed',bg:'yellow',left:x,top:y,w:w,h:h});
		// //let d2=mDiv(dTable,{position:'fixed',bg:'orange',left:x+dx,top:y+dy,w:w,h:h});
		//let d3=mDiv(dTable,{position:'fixed',bg:'red',left:x-dx,top:y-dy,w:w,h:h});

		let dw = Math.abs(rPerle.w - rField.w);
		let dh = Math.abs(rPerle.h - rField.h);
		dw /= 2, dh /= 2;
		//let d4=mDiv(dTable,{rounding:'50%',position:'fixed',bg:'#00ff0080',left:x-dx-dw,top:y-dy-dh,w:w,h:h});

		let [xFinal, yFinal] = [x - dx - dw, y - dy - dh];
		//d4 hat correct ccords
		//reche die auf coords relative to field parent um
		let dFieldParent = dField.parentNode;
		let rParent = getRect(dFieldParent);

		//console.log('parent info', dFieldParent, rParent);

		let xField = xFinal - rParent.x;
		let yField = yFinal - rParent.y;
		let [cxFinal, cyFinal] = [xField + w / 2, yField + h / 2];
		//console.log('field', target);
		let dxy = { x: cxFinal - target.center.x, y: cyFinal - target.center.y };

		mStyleX(dField, { left: xField, top: yField }); //,bg:'blue'});
		target.dxy = source.dxy = dxy;
		//es muss noch die haelfte der size diff zwischen perle und field abgezogen werden
		// mStyleX(d,{left:x,top:y,w:w,h:h,position:'fixed'});
		// mStyleX(d,{left:x+dx,top:y+dy,w:w,h:h,position:'fixed'});
		// mStyleX(d,{left:x+dx,top:y+dy,w:w,h:h,position:'fixed'});

		let displaced = null;
		if (target.item == source) sendMoveField(target);
		else if (isdef(target.item)) displaced = target.item;

		if (isdef(source.field)) {
			let f = source.field;
			sendMovePerle(source, f, target, displaced);
		} else {
			//console.log('sending place ')
			sendPlacePerle(source, target, displaced);
		}
		return;
	}
	moveCenter(target, source, dx, dy) {
		//console.log('moveCenter', target, source, dx, dy)
		let dTarget = iDiv(target);
		let center = target.center;
		let newCenter = { x: center.x + dx, y: center.y + dy };
		target.dxy = { x: dx, y: dy };
		let rect = getRect(dTarget);
		mStyleX(dTarget, { left: newCenter.x - rect.w / 2, top: newCenter.y - rect.h / 2 });
		source.dxy = { x: dx, y: dy };

	}
	resetCenter(target) {
		let dTarget = iDiv(target);
		let center = target.center;
		let rect = getRect(dTarget);
		mStyleX(dTarget, { left: center.x - rect.w / 2, top: center.y - rect.h / 2 });
		delete target.dxy;
		if (isdef(target.item)) delete target.item.dxy;
	}
	processData(data) {
		if (nundef(data)) data = createFakeState();
		//console.log('got data:', jsCopy(data));

		if (nundef(this.state)) this.state = {}; copyKeys(data.state, this.state);

		if (isdef(data.settings)) {
			console.assert(isdef(this.settings), 'processData G.settings is NOT defined after constructor!!!!!')
			copyKeys(data.settings, this.settings);
		}

		if (isdef(data.perlenDict)) { PerlenDict = this.perlenDict = data.perlenDict; }

		if (isdef(data.state.pool)) { //sent new pool!
			//console.log('got POOL!')
			this.perlenListeImSpiel = Object.values(this.state.pool);
			this.poolEnriched = this.state.pool;
			//console.log('perlenDict', this.perlenDict)
			for (const idx in this.state.pool) {
				let p = this.state.pool[idx];
				let key = p.key;
				// console.log(p, key)
				copyKeys(this.perlenDict[key], p);

				console.log(p.key);

				p.path = mPath(p);
			}
		}
		return [this.settings, this.state]; //, needToLoadBoard];
	}
	setInitialPoolSelected() { this.initialPoolSelected = true; setTitle('Glasperlenspiel'); }
	inSyncWithServer() {

		//return;
		let [b, s, st] = [this.clientBoard, this.settings, this.state];
		//console.log('sync:','\nboard',b,'\nsettings',s,'\nstate',st);
		let corr = {};
		if (st.boardArr.length != b.nFields) { corr.nFields = s.nFields = b.nFields; }
		if (s.rows != b.rows || s.cols != b.cols) { corr.rows = s.rows = b.rows; corr.cols = s.cols = b.cols; }
		if (!isEmpty(Object.keys(corr))) {
			console.log('sending syncBoardLayout!!! corr', corr)
			Socket.emit('settings', { settings: this.settings });
			// Socket.emit('syncBoardLayout', { nFields: b.nFields, rows: b.rows, cols: b.cols, layout: b.layout, boardFilename: b.boardFilename });
			return false;
		}
		else { return true; }
	}



}

//#region perlen game start here!
function simplestPerlenGame() {

	// console.log('arrno',arrNoDuplicates([1,2,3,4,5,3,2,4,1]));

	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + Username);
	let color = USERNAME_SELECTION == 'local' ? localStorage.getItem('BaseColor') : null;
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();
	ColorThiefObject = new ColorThief();
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
	mBy('sidebar').ondblclick = () => { closeAux();hide('sidebar') };
	G = VERSION == 7 ? new SimpleClass7() : new SimpleClass();
	Settings = new PerlenSettingsClass(G.settings, U, mBy('dSettingsWindow'));
	if (!USESOCKETS) G.presentGameState();
}
//skip next 2 steps!
function handleInitialPool(data) {
	console.assert(isdef(G), 'G not defined!!!!!!!!!!!')
	//if (nundef(G.settings) && isdef(data.settings)) 
	if (isdef(data.settings) && isdef(G.settings)) copyKeys(data.settings, G.settings);
	else if (isdef(data.settings)) copyKeys(data.settings, G.settings);
	else if (isdef(G.settings)) G.settings.individualSelection = true;
	else if (nundef(data.settings) && nundef(G.settings)) copyKeys({ individualSelection: true }, G.settings);
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
function handleDbUpdate(data) {
	logClientReceive('dbUpdate', data);
	//console.log('data',data)
	DB.standardSettings = data.standardSettings;
}

function sendMovePerle(perle, fFrom, fTo, dis) {
	//console.log('===> PLACE')
	let data = { dxy: perle.dxy, iPerle: perle.index, iFrom: fFrom.index, iTo: fTo.index, displaced: isdef(dis) ? dis.index : null, username: Username };
	logClientSend('movePerle', data);
	Socket.emit('movePerle', data);
}
function sendMoveField(f) {
	//console.log('===> PLACE')
	let data = { dxy: f.item.dxy, iField: f.index, username: Username };
	logClientSend('moveField', data);
	Socket.emit('moveField', data);
}
function sendRemovePerlen(plist, fields) {
	console.log('===> remove list', plist, fields);
	let data = { iPerlen: plist.map(x => x.index), iFroms: fields.map(x => x.index), username: Username };
	logClientSend('removePerlen', data);
	Socket.emit('removePerlen', data);
}
function sendRemovePerle(perle, fFrom) {
	//console.log('===> PLACE')
	let data = { iPerle: perle.index, iFrom: fFrom.index, username: Username };
	logClientSend('removePerle', data);
	Socket.emit('removePerle', data);
}
function sendPlacePerle(perle, field, dis) {
	//console.log('hallo sending move')
	let data = { dxy: perle.dxy, iPerle: perle.index, iField: field.index, displaced: isdef(dis) ? dis.index : null, username: Username };
	logClientSend('placePerle', data);
	Socket.emit('placePerle', data);
}
//unused!
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

	if (ev.code == 'Escape' && isVisible('dAux')) {
		console.log('hiding dAux!')
		hide('dAux');
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
	if (ev.key == 'Alt' && isdef(Socket)) { Socket.emit('show', { username: Username }); }

}

//#endregion


function createPerle(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	//console.log('perle', perle);

	//console.log('createPerle freeForm:',G.settings.freeForm)
	if (perle.field != null) { //board perle!
		perle.live.dLabel.remove();
		let img = perle.live.dImg;

		let d = iDiv(perle);
		let rect = getRect(img);

		//console.log('img', img, rect)
		//console.log('d', d, getRect(d))

		let szField = G.settings.szField; //dxCenter - G.settings.wGap;
		let sz = G.settings.szPerle * szField / 100;
		// let sz = (G.settings.freeForm) ? szField
		// 	: isdef(G.settings.szPerle) ? szField * G.settings.szPerle / 100
		// 		: 100;
		//sz = Math.max(sz, 50);
		if (isFarbPerle(perle)) mStyleX(img, { w: 1, h: 1 });
		else mStyleX(img, { w: sz, h: sz });
		mStyleX(d, { bg: 'transparent',w:sz,h:sz });
	} else {
		//styling for pool perle
		let d = iDiv(perle);
		mStyleX(d, { opacity: 1-G.settings.dimming/100 });
		let sz = G.settings.szPoolPerle;
		if (isdef(sz)){
			mStyleX(d.firstChild,{w: sz,h:sz});
		}

	}

	return d;
}
function dragStartPreventionOnSidebarOpen() {
	if (isdef(mBy('drop-region'))) {
		alert('please close sidebar (by DOUBLECLICK on it) before proceeding!');
		return false;
	}
	return true;
}
function isFarbPerle(perle) { return isGermanColorName(perle.key); }
function mPath(p) { 
	console.log(p);
	if (!(p.path.includes('.'))) p.path += '.png';

	return PERLENPATH_FRONT + 'perlen/' + p.path; 

}

// function mPath(p) {
// 	let pre = PERLENPATH_FRONT+'/perlen/';
// 	let post = '.png';
// 	if (isdef(p.path)) return p.path[0] == '.' ? p.path : pre + p.path + post;
// 	let x = p.text.toLowerCase();
// 	x = replaceAll(x, "'", "");
// 	//x = replaceAll(x, " ", "_");
// 	return pre + x + post;
// }



