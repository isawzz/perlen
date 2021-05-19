
class SimpleClass {
	constructor() { this.dParent = dTable; }
	initialPool(pool) {
		let perlenItems = this.pool = pool;
		perlenItems.map(x => x.path = mPath(x));
		let dParent = this.dParent;
		mText('Pick your Perlen set!', dParent, { h: 25 });
		mButton('Submit', sendInitialPool, dParent, { h: 25 }, ['buttonClass'])
		mLinebreak();
		showPerlenPool(perlenItems, dTable);
	}
	presentGameState(data) {
		clearElement(this.dParent);
		console.log('in simple!', data.state);
		copyKeys(data.state, this);
		console.log('_______ PRESENT:');www();

		let allePerlen;
		if (isdef(data.state.pool)) {
			allePerlen = this.allePerlenItems = this.pool;
			allePerlen.map(x => x.path = mPath(x));
		} else {
			allePerlen = this.allePerlenItems;
		}
		this.pool = this.poolArr.map(x=>allePerlen[x]);
		let dParent = this.dParent;

		//console.log('______________', 'show board!', this.rows, this.cols)
		let board = this.board = showEmptyPerlenBoard(this.rows, this.cols, dParent);

		mLinebreak(dParent, 25);

		showPerlenPool(this.pool, dParent);

		console.log('perlen',allePerlen)
		console.log('boardArr',this.boardArr)
		populateBoard(this.board, this.boardArr, allePerlen);

		this.activateDD();

	}

	activateDD() {
		enableDD(this.allePerlenItems, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerleSimple.bind(this), false);
	}
	onDropPerleSimple(source, target) {
		if (isdef(source.field)){
			removeItemFromField(source); //sollte nicht mehr brauchen!
			sendMovePerle(source,target);
		}else{
			sendPlacePerle(source,target);
		}

		addItemToField(source, target, this.dParent);
	}
	sendRelayout(perlen){
		// was muss ich jetzt senden?
		//was hat sich veraendert?
		let [boardArr,pRemoved] = perlenToArrays(this.board,perlen);
	  pRemoved.map(x=>this.poolArr.push(x));
		this.boardArr = boardArr;
		//console.log('===>RELAYOUT');
		//console.log('boardArr',this.boardArr);
		//console.log('poolArr',this.poolArr);
		//console.log('===>RELAYOUT all',this.allePerlenItems.length);
		let notOnField = this.allePerlenItems.filter(x=>x.field==null);
		//console.log('===>RELAYOUT pool',notOnField.length);
		let poolArr2 = notOnField.map(x=>x.index);
		//console.log('poolArr2',poolArr2);
		sendRelayout(this.board.rows,this.board.cols,this.boardArr,this.poolArr);

	}






	onDropPerle(source, target, isCopy = false) {
		let dSource = iDiv(source);
		let dTarget = iDiv(target);

		if (!isCopy) {
			this.remove(source);
			addItemToField(source, target, this.dParent);
		} else {
			let newPerle = this.clone(source);
			let dNew = mImg(perle.path, dTarget, { w: 70, h: 70 });
			iAdd(newPerle, { div: dNew });
			addItemToField(source, target, this.dParent);
			addDDSource(dNew, false);
		}
	}







	clone(perle) {
		let clone = {};
		copyKeys(perle, clone, { live: true, div: true });
		return clone;
	}
	remove(perle) {
		let field = perle.field;
		if (isdef(field)) {
			perle.field = null;
			field.item = null;
			iDiv(perle).remove;
		}
	}
	add(perle, field) {
		//what if this perle is on a different field? should I clone it then? NO
		//console.log('addto field', field);
		addItemToField(perle, field, dTable);
	}

}
