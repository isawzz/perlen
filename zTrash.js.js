class GPerl{
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
