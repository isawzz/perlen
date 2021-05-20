
function boardArrReduced(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);

			res.push(boardArr[i]);
		}
	}
	return res;

}

function logState(state){
	let [rows, cols, boardArr, poolArr] = [state.rows, state.cols, state.boardArr, state.poolArr];
	let bar = boardArrReduced(boardArr, rows, cols);
	//console.log('boardArr', bar, '\npoolArr', poolArr, '\ndims', rows - 1, 'x', cols - 1);
}
class SimpleClass {
	constructor() { this.dParent = dTable; }
	presentGameState(data) {

		let state = data.state;
		logState(state);
		copyKeys(state, this);
		let dParent = this.dParent;

		clearElement(dParent);

		if (isdef(state.pool)) {
			this.pool = state.pool;
			this.pool.map(x => x.path = mPath(x));
		}

		this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);
		mLinebreak(dParent, 25);

		showPerlen(this.pool,this.boardArr,this.poolArr,this.board,dParent);
		// showPerlenPool(this.pool, this.poolArr, dParent);
		// //console.log('perlen',allePerlen)
		// //console.log('boardArr',this.boardArr)
		// populateBoard(this.board, this.boardArr, this.pool);

		this.activateDD();

	}
	activateDD() {
		enableDD(this.pool, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimple.bind(this), false);
	}
	onDropPerleSimple(source, target) {
		let displaced = null;
		if (isdef(target.item)) {
			let p = target.item;
			removeItemFromField(p);
			displaced = p;
		}
		if (isdef(source.field)) {
			let f = source.field;
			removeItemFromField(source); //sollte nicht mehr brauchen!
			addItemToField(source, target, null);
			sendMovePerle(source, f, target, displaced);
		} else {
			addItemToField(source, target, null);
			sendPlacePerle(source, target, displaced);
		}

	}
	sendRelayout(perlen) {
		// was muss ich jetzt senden?
		//was hat sich veraendert?
		let [boardArr, pRemoved] = perlenToArrays(this.board, perlen);
		pRemoved.map(x => this.poolArr.push(x));
		this.boardArr = boardArr;
		//console.log('===>RELAYOUT');
		//console.log('boardArr',this.boardArr);
		//console.log('poolArr',this.poolArr);
		//console.log('===>RELAYOUT all',this.allePerlenItems.length);
		let notOnField = this.allePerlenItems.filter(x => x.field == null);
		//console.log('===>RELAYOUT pool',notOnField.length);
		let poolArr2 = notOnField.map(x => x.index);
		//console.log('poolArr2',poolArr2);
		sendRelayout(this.board.rows, this.board.cols, this.boardArr, this.poolArr);

	}
}

