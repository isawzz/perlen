var Schritt = 0;
class SimpleClass {
	constructor() { this.dParent = dTable; }
	checkInitialPoolDone() {
		if (!this.initialPoolSelected) {
			Socket.emit('initialPoolDone', { username: Username });
			this.initialPoolSelected = true;
			setTitle('Glasperlenspiel');
		}

	}
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
		let [settings, state] = this.copyData(data);
		console.log('present', this.settings);

		clearElement(this.dParent); Schritt += 1;



		let b=state.board;

		this.clientBoard = createClientBoard(this.dParent,b.filename,b.layout,b.cells.w,b.cells.h,b.cells.wgap,b.cells.hgap);

		//console.log('board',this.clientBoard);
		mLinebreak(this.dParent, this.settings.IsTraditionalBoard ? 25 : 45);

		//console.log('___________', Schritt, this.state, this.state.poolArr);
		showPerlen(this.perlenListeImSpiel, this.state.boardArr, this.state.poolArr, this.clientBoard, this.dParent);
		this.activateDD();

		console.log('state.boardArr',state.boardArr)
		if (isEmpty(state.boardArr)) sendBoardArr(clientBoard.fields.length);

	}
	activateDD() {
		let fields = this.settings.IsTraditionalBoard ? this.clientBoard.fields.filter(x => x.row > 0 && x.col > 0) : this.clientBoard.fields;
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
