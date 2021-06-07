var StepCounter = 0;

class SimpleClass7 {
	constructor() {
		this.dParent = dTable;
		this.initialPoolSelected = false;
		this.settings = {};
		openToolbar();
	}
	presentGameState(data) {

		console.log('_________________________gs',StepCounter);StepCounter += 1;

		mStyleX(dTable, { h: window.innerHeight });

		let [settings, state] = this.processData(data);
		if (settings == Settings.o && Settings.o == this.settings) console.log('...settings ok'); else console.assert(settings == Settings && Settings == this.settings,'hallo settings FALSCH!!!!!!!!!!!!!')
		let needToLoadBoard = nundef(this.clientBoard) || this.clientBoard.boardFilename != settings.boardFilename;
		//timit = new TimeIt('*');

		//jetzt sind settings,state,perleDict,pool,needToLoadBoard up-to-date

		if (needToLoadBoard) {
			clearElement(this.dParent);
			//console.log('NEW BOARD!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.settings.boardFilename);
			this.clientBoard = { boardFilename: this.settings.boardFilename };

			this.calcLayoutParameters(); 
			let correct = this.syncBoardLayout(); 
			if (!correct) {
				console.log('server data?', correct ? 'correct' : 'WRONG!!!'); //propag params to server if needed!				
				return;
			} else console.log('...sync ok');
			//hier soll dOuter machen

			let dOuter = this.clientBoard.dOuter = mDiv(this.dParent, { hmin: 768, wmin: 768, display: 'inline-block', position: 'relative' }, 'dBoardOuter');
			mCenterCenterFlex(dOuter);
			mLinebreak(this.dParent, 30);

			let dPool = this.dPool = mDiv(this.dParent);

			//timit.show('vorher');
			this.loadBoardImage(); //das ladet image und size und setzt dOuter w,h,backgroundImage when done!

			//I already have the centers at this point!
			this.createFields();

		} else {
			this.clearBoard();
			this.clearPool();
			//console.log('NOT REBUILDING BOARD!!!', this.clientBoard)
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

	//#region done
	calcLayoutParameters() {
		let s = this.settings;
		let b = this.clientBoard;
		let [layout, wCell, hCell, rows, cols] = [s.boardLayout, s.wField, s.hField, s.rows, s.cols];

		let isHexLayout = startsWith(layout, 'hex');
		let hline = isHexLayout ? hCell * .75 : hCell;

		//determineRowsAndCols
		//for circle, need to determine which area of board should be covered by fields
		//this area is s.wFieldArea, s.hFieldArea
		if (nundef(rows) || layout == 'circle') rows = Math.floor(s.hFieldArea / hline);
		if (nundef(cols) || layout == 'circle') cols = Math.floor(s.wFieldArea / wCell)

		let [centers, wNeeded, hNeeded] = getCentersFromRowsCols(layout, rows, cols, wCell, hCell);

		s.nFields = centers.length;

		//console.log('layout', layout, 'wNeeded', wNeeded, 'hNeeded', hNeeded);
		//console.log('nFields', s.nFields, 'rows', rows, 'cols', cols);
		[b.nFields, b.wNeeded, b.hNeeded, b.centers] = [s.nFields, wNeeded, hNeeded, centers];
		[b.layout, b.rows, b.cols, b.wField, b.hField, b.hline] = [s.boardLayout, rows, cols, wCell, hCell, hline];
		return s.nFields;
	}
	getImagePath(key) {
		console.assert(key.includes('.'), 'getImagePath: not a filename!!!', key)
		let ext = stringAfter(key, '.'); if (isEmpty(ext)) ext = 'png';
		let filename = stringBefore(key, '.') + '.' + ext;
		let path = PERLENPATH_FRONT + 'bretter/' + filename;
		return path;
	}
	imageMeasurePreload(path, whenSize, whenLoaded) {
		if (nundef(this.images)) this.images = {};

		let data = this.images[path] = {};
		var img = document.createElement('img');
		img.src = path;

		var poll = setInterval(() => {
			if (img.naturalWidth) {
				//have size!!!
				data.w = img.naturalWidth; data.h = img.naturalHeight;
				clearInterval(poll);
				// console.log(img.naturalWidth, img.naturalHeight);
				if (isdef(whenSize)) whenSize(data.w, data.h);
				//timit.show('done size!');
			}
		}, 100);

		img.onload = ev => {
			if (isdef(whenLoaded)) whenLoaded(ev);
			//console.log('Fully loaded');
			//timit.show('done loading!')
		}
	}
	loadBoardImage() {
		let [b, s] = [this.clientBoard, this.settings];

		let key = s.boardFilename;
		mStyleX(b.dOuter, { w: s.wBoard, h: s.hBoard }); //,border:'white'});
		if (key == 'none') { return; }

		let path = this.getImagePath(key);
		// console.log('path to board file',path)
		let whenSize = (w, h) => {
			// if (h < 768) mStyleX(b.dOuter, { w: w, h: h, hmin: h });
			// else mStyleX(b.dOuter, { w: w, h: h });
			if (s.sizeBoardHeightToImage && h>s.hBoard) mStyleX(b.dOuter,{h:h});
			//b.boardImageSize = { w: w, h: h };
		};
		let whenLoaded = ev => {
			let img = ev.target;
			//console.log('===>background loaded', img, b.dOuter);
			b.dOuter.style.backgroundImage = `url(${img.src})`;
			mStyleX(b.dOuter, { 'background-size':s.boardImageSize, 'background-repeat': 'no-repeat', 'background-position': 'center center' });
			// 'background-size':s.boardImageSize, 
		}
		this.imageMeasurePreload(path, whenSize, whenLoaded);

	}
	processData(data) {
		if (nundef(data)) data = createFakeState();
		//console.log('got data:', jsCopy(data));

		if (nundef(this.state)) this.state = {}; copyKeys(data.state, this.state);

		if (isdef(data.settings)) {
			console.assert(isdef(this.settings),'processData G.settings is NOT defined after constructor!!!!!')
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
				//console.log(p, key)
				copyKeys(this.perlenDict[key], p);
				p.path = mPath(p);
			}
		}
		return [this.settings, this.state]; //, needToLoadBoard];
	}
	setInitialPoolSelected() { this.initialPoolSelected = true; setTitle('Glasperlenspiel'); }
	syncBoardLayout() {
		//wenn irgendwelche params anders sind als bei server, speziell boardArr.length != nFields ist => send settings!
		//correct settings according to clientBoard!

		let [b, s, st] = [this.clientBoard, this.settings, this.state];
		let corr = {};
		if (st.boardArr.length != b.nFields) { corr.nFields = s.nFields = b.nFields; }
		if (s.rows != b.rows || s.cols != b.cols) { corr.rows = s.rows = b.rows; corr.cols = s.cols = b.cols; }
		if (!isEmpty(Object.keys(corr))) {
			console.log('should send settings: ', b)
			Socket.emit('syncBoardLayout', { nFields: b.nFields, rows: b.rows, cols: b.cols, layout: b.layout, boardFilename: b.boardFilename });
			return false;
		}
		else { return true; }
	}



}


