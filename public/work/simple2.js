var VerboseSimple2Class = true;
class Simple2Class {
	constructor() { this.dParent = dTable; }
	presentGameState(data) {

		let state = data.state; logState(state); copyKeys(state, this); let dParent = this.dParent;

		clearElement(dParent);

		if (isdef(state.pool)) {
			this.pool = state.pool;
			this.perlenListeImSpiel = Object.values(this.pool);
			for(const idx in this.pool){let p=this.pool[idx]; p.path = mPath(p);}
		}

		this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);
		mLinebreak(dParent, 25);

		showPerlen(this.perlenListeImSpiel, this.boardArr, this.poolArr, this.board, dParent);
		this.activateDD();

	}
	activateDD() {
		enableDD(this.perlenListeImSpiel, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimplest.bind(this), false);
		addDDTarget({item:this.poolArr, div: this.dParent }, false, false);
	}
	onDropPerleSimplest(source, target) {
		//console.log('dropHandler!',source,target)
		if (target.item == this.poolArr) {
			//console.log('===>perle',source,'needs to go back to pool!');
			let f=source.field;
			if (isdef(f)) sendRemovePerle(source,f);
		} else {
			let displaced = null;
			if (isdef(target.item)) {
				let p = target.item;
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
	onDropPerle2(source, target) {
		if (isdef(source.field)) {
			let f = source.field;
			sendMovePerle(source, f, target, displaced);
		} else {
			sendPlacePerle(source, target, displaced);
		}

	}

}

function showPerlen(perlenByIndex, boardArr, poolArr, board, dParent) {
	for (let i = 0; i < poolArr.length; i++) {
		let iPerle = poolArr[i];
		perle = perlenByIndex[iPerle];
		perle.field = perle.row = perle.col = null;
		let ui = createPerle(perle, dParent, 64, 1.3, .4);
	}
	for (let i = 0; i < boardArr.length; i++) {
		let iPerle = boardArr[i];
		if (iPerle == null) continue;
		let perle = perlenByIndex[iPerle];
		let field = board.fields[i];
		perle.row = field.row;
		perle.col = field.col;
		perle.field = field;
		field.item = perle;
		let ui = createPerle(perle, iDiv(field), 64, 1.3, .4);
	}
}
function showEmptyPerlenBoard1(rows, cols, dParent) {
	let dp = mDiv(dParent, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	let x = mImg('../assets/games/perlen/bretter/brett01.png', d1, {});



	let board = { rows: rows, cols: cols, div: d1, fields: x };
	//createFields(board, rows, cols);
	return board;
}














