function addPerle(item, field) {
	let prev = field.item;
	if (isdef(prev) && isdef(dRemoved)) {
		mAppend(dRemoved, iDiv(prev));
	}
	let dField = iDiv(field);
	item.row = field.row;
	item.col = field.col;
	item.field = field;
	field.item = item;
	//console.log(item,field,dField,iDiv(item))
	mAppend(dField, iDiv(item));

}
function www() {
	//console.log('dims',G.rows,G.cols,'\nboard',G.boardArr,'\npool',G.poolArr)
}
function showPerlenPool(pool, poolArr, dParent) {
	for (let i = 0; i < poolArr.length; i++) {
		let ui = createPerle(pool[poolArr[i]], dParent, 64, 1.3, .4);
	}
	return poolArr;
}

function populateBoard(board, state, perlenItems) {
	//console.log('board', board);
	//wie komm ich jetzt auf die fields?
	for (let i = 0; i < state.length; i++) {
		let iPerle = state[i];
		let iField = i;
		//console.log('iPerle',iPerle,state)
		if (isNumber(iPerle)) {
			let perle = perlenItems[iPerle];
			let field = board.fields[iField];
			addItemToField(perle, field, null);
		}
	}
}

class GSimPerl{
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
	initialPool(pool) {
		let perlenItems = this.pool = pool;
		perlenItems.map(x => x.path = mPath(x));
		let dParent = this.dParent;
		mText('Pick your Perlen set!', dParent, { h: 25 });
		mButton('Submit', sendInitialPool, dParent, { h: 25 }, ['buttonClass'])
		mLinebreak();
		showPerlenPool(perlenItems, dTable);
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
}
function simplestPerlenGame(username, io) {

	console.assert(isdef(U), 'User data not set!!!!!!!!!!!!!!!!')

	if (io && isString(username)) { sendLogin(username); }//console.log('...', username) }
	else username = U.name;

	//hide('dHeader'); 
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + username);

	let color = AUTOLOGIN? null:localStorage.getItem('BaseColor');
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

	if (!USESOCKETS) waitUntilPerlen();
	else { requestInitialPosition(Username); }

}
