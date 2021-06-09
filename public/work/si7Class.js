var StepCounter = 0;

class SimpleClass7 {
	constructor() {
		this.dParent = dTable;
		this.initialPoolSelected = false;
		this.settings = {};
		openToolbar();
	}
	presentGameState(data) {

		//setTimeout(		onClickEditLayout,200		);
		console.log('_________________________gs', StepCounter); StepCounter += 1;

		mStyleX(dTable, { h: window.innerHeight });

		let [settings, state] = this.processData(data);
		if (settings == Settings.o && Settings.o == this.settings) console.log('...settings ok'); else console.assert(settings == Settings && Settings == this.settings, 'hallo settings FALSCH!!!!!!!!!!!!!')
		let needToLoadBoard = nundef(this.clientBoard) || this.clientBoard.boardFilename != settings.boardFilename;
		//timit = new TimeIt('*');

		//jetzt sind settings,state,perleDict,pool,needToLoadBoard up-to-date

		if (needToLoadBoard) {
			clearElement(this.dParent);
			this.clientBoard = applyStandard(this.dParent, this.settings);

			if (!this.inSyncWithServer()) return; else console.log('...sync ok!');

			mLinebreak(this.dParent, 30);

			let dPool = this.dPool = mDiv(this.dParent);
		} else {
			console.log('...sync ok (no board)');
			this.clearBoard();
			this.clearPool();
		}

		this.presentPerlen();
		this.activateDD();
		if (settings.poolSelection != 'random' && this.initialPoolSelected == false) {
			createPerlenEditor();
			setTitle(data.instruction);
		}
	}
	chooseBoard(boardFilename) {
		if (boardFilename == this.settings.boardFilename) return;
		Socket.emit('chooseBoard', { boardFilename: boardFilename });
	}
	createFields() {
		let [b, s] = [this.clientBoard, this.settings];
		let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop, maleft: s.boardMarginLeft, w: b.wNeeded, h: b.hNeeded, position: 'relative' }); //, bg: 'green' });

		let [wCell, hCell, wGap, hGap] = [s.wField, s.hField, s.wGap, s.hGap];
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
	clearBoard() {
		let b = this.clientBoard;
		for (const f of b.fields) {

			let p = f.item;
			if (isList(p)) {
				//console.log(f);
				//console.log(p);
				continue;
			}
			if (isdef(p)) {
				//console.log('removing',p,iDiv(p))
				iDiv(p).remove();
				f.item = null;
			}
		}
	}
	clearPool() { clearElement(this.dPool); }
	presentPerlen() {
		let [b, s, perlenByIndex, boardArr, poolArr] = [this.clientBoard, this.settings, this.poolEnriched, this.state.boardArr, this.state.poolArr];

		let dParent = this.dPool;
		for (let i = 0; i < poolArr.length; i++) {
			let iPerle = poolArr[i]; //console.log('iPerle', iPerle, perlenByIndex, perlenByIndex[iPerle]);
			let perle = perlenByIndex[iPerle]; //console.log('perle', perle)
			perle.field = null;
			let ui = createPerle(perle, dParent, 64, 1.3, .4);
		}
		for (let i = 0; i < boardArr.length; i++) {
			let iPerle = boardArr[i];
			if (iPerle == null) continue;
			let perle = perlenByIndex[iPerle]; //console.log('perle auf dem board', perle)
			let field = b.fields[i];
			perle.field = field;
			field.item = perle;
			let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);
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
	onDropPerleSimplest(source, target) {
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


