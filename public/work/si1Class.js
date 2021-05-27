var Schritt = 0;
class SimpleClass1 {
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

		Schritt += 1;
		let state = data.state; logState(state); copyKeys(state, this); let dParent = this.dParent;
		this.State = state;
		//let x=filterByKey(state,'rows,cols');
		//console.log('x',x)

		clearElement(dParent);

		//console.log('state',state,'\nclientId',Socket.id);
		if (isdef(state.pool)) {
			this.pool = state.pool;
			this.perlenListeImSpiel = Object.values(this.pool);
			//console.log('POOL IS HERE!!!',this.perlenListeImSpiel[0].Name)

			for (const idx in this.pool) { let p = this.pool[idx]; p.path = mPath(p); }
		}

		this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);
		mLinebreak(dParent, 25);

		//console.log('___________',Schritt,state,state.poolArr);
		showPerlen(this.pool, this.boardArr, this.poolArr, this.board, dParent);
		this.activateDD();

	}
	activateDD() {
		enableDD(this.perlenListeImSpiel, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimplest.bind(this), false, false, dragStartPreventionOnSidebarOpen);
		addDDTarget({ item: this.poolArr, div: this.dParent }, false, false);
	}
	onDropPerleSimplest(source, target) {
		//console.log('dropHandler!',source,target)
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
				sendPlacePerle(source, target, displaced);
			}
		}

	}
}
