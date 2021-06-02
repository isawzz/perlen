var Schritt = 0;
//var PresentationCompleted=true;
//var TOPresentation;
class SimpleClass {
	constructor() {
		this.dParent = dTable;
		this.initialPoolSelected = false;
	}
	setInitialPoolSelected() { this.initialPoolSelected = true; setTitle('Glasperlenspiel'); }
	copyData(data) {
		if (nundef(data)) data = createFakeState();
		//console.log('got data:', jsCopy(data));

		if (nundef(this.state)) this.state = {}; copyKeys(data.state, this.state);

		if (isdef(data.settings)) {
			if (nundef(this.settings)) this.settings = {};
			copyKeys(data.settings, this.settings);
			//initToolbar(this.settings);
			// console.log('got settings:', this.settings)
		}

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
		return [this.settings, this.state];
	}
	presentGameState(data) {
		//console.log('data',data); return;
		let [settings, state] = this.copyData(data);

		clearElement(this.dParent); Schritt += 1;

		if (settings.poolSelection != 'random' && this.initialPoolSelected == false) {
			createPerlenEditor();
			setTitle(data.instruction);
		}

		console.assert(this.settings == settings,'SETTINGS MISMATCH!!!!!!')
		let s = this.settings;
		console.log('settings', s.boardFilename,s.boardLayout,s.nFields); 
		console.log('state', state);



		if (isEmpty(s.boardFilename)) { createBoardEditor(); setTitle('pick a board'); return; }
		if (nundef(s.boardLayout)) { openSettings(); setTitle('specify board layout'); return; }

		let dOuter = this.dBoardOuter = mDiv(this.dParent, { display: 'inline-block', position: 'relative' }, 'dBoardOuter');
		if (isdef(s.boardFilename)) {
			let img, wOuter, hOuter;
			let path = './assets/games/perlen/bretter/' + s.boardFilename + '.png';
			img = this.boardImage = mImg(path, dOuter, null, null, this.sizeDOuter.bind(this));
		} else {
			this.boardImage = null;
			this.sizeDOuter();
		}
	}
	sizeDOuter() {
		let img = this.boardImage;
		let [wOuter, hOuter] = isdef(img) ? [img.naturalWidth, img.naturalHeight] : [1000, 700];
		let dOuter = this.dBoardOuter;
		mStyleX(dOuter, { w: wOuter, h: hOuter }); //full board size!!!

		//console.log('hallo da bin ch jetzt!');

		let dInner = this.dBoardInner = mDiv(dOuter, { left: 0, top: 0, w: wOuter, h: hOuter, position: 'absolute' }, 'dBoardInner');//,'background-image':path });
		this.clientBoard = { dOuter: dOuter, wOuter: wOuter, hOuter: hOuter, dInner: dInner };

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