var Schritt = 0;
class SimpleClass2 {
	constructor() {
		this.dParent = dTable;
	}
	checkInitialPoolDone() {
		if (!this.INITIAL_POOL_DONE) {
			Socket.emit('initialPoolDone', { username: Username });
			this.INITIAL_POOL_DONE = true;
			setTitle('Glasperlenspiel');
		}

	}
	presentGameState(data) {

		let dParent = this.dParent;
		clearElement(dParent);

		Schritt += 1;
		let state = data.state; logState(state); 
		copyKeys(state, this); 
		
		this.State = state;
		//console.log('===>boardArr',state.boardArr)
		//let x=filterByKey(state,'rows,cols');
		//console.log('x',x)
		//console.log('PerlenDict',isdef(PerlenDict)?jsCopy(PerlenDict):'no perlenDict!!!');
		if (isdef(data.perlenDict)) PerlenDict = data.perlenDict;

		if (isdef(data.settings)) {
			//console.log('got settings!',data.settings)
			SkipInitialSelect = data.settings.SkipInitialSelect;
			IsTraditionalBoard = data.settings.IsTraditionalBoard;
			initToolbar();
		}


		//console.log('state',state,'\nclientId',Socket.id);
		if (isdef(state.pool)) {
			this.pool = state.pool;
			this.perlenListeImSpiel = Object.values(this.pool);
			//console.log('POOL IS HERE!!!',this.perlenListeImSpiel[0].Name)

			for (const idx in this.pool) { let p = this.pool[idx]; p.path = mPath(p); }
		}

		//console.log('state', state);
		//let IsTraditionalBoard = isdef(this.rows);
		this.clientBoard = IsTraditionalBoard ? showEmptyPerlenBoard(this.rows, this.cols, dParent)
			: showBrettBoard(this.board.filename, dParent);

		mLinebreak(dParent, IsTraditionalBoard ? 25 : 45);

		//console.log('___________',Schritt,state,state.poolArr);
		showPerlen(this.pool, this.boardArr, this.poolArr, this.clientBoard, dParent);
		this.activateDD();

	}
	activateDD() {
		let fields = IsTraditionalBoard? this.clientBoard.fields.filter(x => x.row > 0 && x.col > 0) : this.clientBoard.fields;
		enableDD(this.perlenListeImSpiel, fields, this.onDropPerleSimplest.bind(this), false, false, dragStartPreventionOnSidebarOpen);
		addDDTarget({ item: this.poolArr, div: this.dParent }, false, false);
	}
	onDropPerleSimplest(source, target) {
		//console.log('dropHandler!',source,'\ntarget',target)
		if (target.item == this.poolArr) {
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
