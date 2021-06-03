var Schritt = 0;
class SimpleClass {
	constructor() {
		this.dParent = dTable;
		this.initialPoolSelected = false;
	}
	setInitialPoolSelected() { this.initialPoolSelected = true; setTitle('Glasperlenspiel'); }
	processData(data) {
		if (nundef(data)) data = createFakeState();
		//console.log('got data:', jsCopy(data));

		if (nundef(this.state)) this.state = {}; copyKeys(data.state, this.state);

		let previousBoardFilename = null, needToLoadBoard = true;
		if (isdef(data.settings)) {
			if (nundef(this.settings)) this.settings = {}; else previousBoardFilename = this.settings.boardFilename;
			copyKeys(data.settings, this.settings);
			if (isdef(data.settings.boardFilename) && previousBoardFilename == data.settings.boardFilename) needToLoadBoard = false;
		} else if (isdef(this.settings.boardFilename)) needToLoadBoard = false;

		if (isdef(data.perlenDict)) { PerlenDict = this.perlenDict = data.perlenDict; }

		if (isdef(data.state.pool)) { //sent new pool!
			//console.log('got POOL!')
			this.perlenListeImSpiel = Object.values(this.state.pool);
			for (const idx in this.state.pool) {
				let p = this.state.pool[idx];
				let key = p.key;
				copyKeys(this.perlenDict[key], p);
				p.path = mPath(p);
			}
		}
		return [this.settings, this.state, needToLoadBoard];
	}
	presentGameState(data) {
		let [settings, state, needToLoadBoard] = this.processData(data);

		//jetzt sind 

		console.log('needToLoadBoard', needToLoadBoard);
		if (needToLoadBoard) { clearElement(this.dParent); this.presentBoard(); }
		else this.presentPerlen();
	}

	imageMeasuring(){
		var img = document.createElement('img');

		img.src = 'some-image.jpg';
		
		var poll = setInterval(function () {
				if (img.naturalWidth) {
						clearInterval(poll);
						console.log(img.naturalWidth, img.naturalHeight);
				}
		}, 10);
		
		img.onload = function () { console.log('Fully loaded'); }		
	}

	presentBoard() {
		clearElement(this.dParent);
		this.clientBoard = {};
		let dOuter = this.clientBoard.dOuter = mDiv(this.dParent, { display: 'inline-block', position: 'relative' }, 'dBoardOuter');
		let path = './assets/games/perlen/bretter/' + this.settings.boardFilename + '.png';
		let img = this.clientBoard.image = mImg(path, dOuter, null, null, this.setBoardDimensions.bind(this));
	}
	setBoardDimensions() {
		let img = this.clientBoard.image;
		let [wOuter, hOuter] = [img.naturalWidth, img.naturalHeight];

		img.remove(); delete this.clientBoard.image;
		this.clientBoard.wBoard = wOuter;
		this.clientBoard.hBoard = hOuter;
		let dOuter = this.clientBoard.dOuter;
		mStyleX(dOuter, { w: wOuter, h: hOuter }); //full board size!!!

		dOuter.style.backgroundImage = `url(${'./assets/games/perlen/bretter/' + this.settings.boardFilename + '.png'})`;
		mCenterCenterFlex(dOuter);

		this.presentFields();
	}
	presentFields() {

		let nFields = this.calcLayoutParameters();
		//if boardArr does not contain this amount of fields, needed to tell that to server!
		console.log('clientBoard', this.clientBoard, '\n', this.clientBoard.dOuter);


		this.addFieldArea();
	}
	calcLayoutParameters() {
		let s = this.settings;
		let b = this.clientBoard;
		let [layout, wCell, hCell, rows, cols] = [s.boardLayout, s.wField, s.hField, s.rows, s.cols];

		let isHexLayout = startsWith(layout, 'hex');
		let hline = isHexLayout ? hCell * .75 : hCell;

		//determineRowsAndCols
		//for circle, need to determine which area of board should be covered by fields
		//this area is s.wFieldArea, s.hFieldArea
		if (nundef(rows) || layout == 'circle') rows = Math.floor(h / hline);
		if (nundef(cols) || layout == 'circle') cols = Math.floor(w / wCell)

		let [centers, wNeeded, hNeeded] = getCentersFromRowsCols(layout, rows, cols, wCell, hCell);

		s.nFields = centers.length;

		console.log('layout', layout, 'wNeeded', wNeeded, 'hNeeded', hNeeded);
		console.log('nFields', s.nFields, 'rows', rows, 'cols', cols);
		[b.nFields, b.wNeeded, b.hNeeded, b.centers] = [s.nFields, wNeeded, hNeeded, centers];
		return s.nFields;
	}
	addFieldArea() {

		return;


		createClientBoardNew(this.clientBoard, this.settings);

		//console.log(this.clientBoard);
		if (isEmpty(this.state.boardArr)) {
			logClientSend('board', { nFields: this.clientBoard.fields.length });
			Socket.emit('board', { nFields: this.clientBoard.fields.length });
			return;
		}
		//console.log('board',this.clientBoard);
		mLinebreak(this.dParent, 35);

		//return;

		//console.log('___________', Schritt, this.state, this.state.poolArr);
		showPerlen(this.perlenListeImSpiel, this.state.boardArr, this.state.poolArr, this.clientBoard, this.dParent);
		this.activateDD();

		//console.log('state.boardArr', state.boardArr)
		//if (isEmpty(state.boardArr)) sendBoardArr(clientBoard.fields.length);
		//PresentationCompleted= true;
	}
	presentPerlen() {
		return;
		if (settings.poolSelection != 'random' && this.initialPoolSelected == false) {
			createPerlenEditor();
			setTitle(data.instruction);
		}

	}
	activateDD() {
		let fields = this.clientBoard.fields;
		//console.log('fields',fields)
		enableDD(this.perlenListeImSpiel, fields, this.onDropPerleSimplest.bind(this), false, false, dragStartPreventionOnSidebarOpen);
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
}