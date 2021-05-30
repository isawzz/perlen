var Schritt = 0;
class SimpleClass {
	constructor() { this.dParent = dTable; }
	checkInitialPoolDone() {
		if (!this.INITIAL_POOL_DONE) {
			Socket.emit('initialPoolDone', { username: Username });
			this.INITIAL_POOL_DONE = true;
			setTitle('Glasperlenspiel');
		}

	}
	presentGameState(data) {

		//console.log('got data:', jsCopy(data));
		clearElement(this.dParent); 
		Schritt += 1;

		if (nundef(this.state)) this.state = {}; copyKeys(data.state, this.state);

		if (isdef(data.settings)) {
			if (nundef(this.settings)) this.settings = {};
			copyKeys(data.settings, this.settings);
			initToolbar(this.settings);
		}

		if (isdef(data.perlenDict)) { PerlenDict = this.perlenDict = data.perlenDict; }

		if (isdef(data.state.pool)) { //sent new pool!
			//console.log('got POOL!')
			this.perlenListeImSpiel = Object.values(this.state.pool);
			for (const idx in this.state.pool) { 
				let p = this.state.pool[idx]; 
				let key = p.key;
				copyKeys(this.perlenDict[key],p);
				p.path = mPath(p); 
			}
		}

		//console.log('perlenDict',this.perlenDict,'\npool',this.perlenListeImSpiel)
		let boardDescription = this.state.board;
		this.clientBoard = this.settings.IsTraditionalBoard ?
			quadBoard(boardDescription.rows, boardDescription.cols, this.dParent)
			: showBrettBoard(boardDescription.filename, this.dParent);

		mLinebreak(this.dParent, this.settings.IsTraditionalBoard ? 25 : 45);

		//console.log('___________',Schritt,state,state.poolArr);
		showPerlen(this.perlenListeImSpiel, this.state.boardArr, this.state.poolArr, this.clientBoard, this.dParent);
		this.activateDD();

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
