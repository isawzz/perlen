var Toolbar;
function openToolbar() {
	let d = mBy('dLeiste');
	show(d);
	mStyleX(d, { w: 100 });
	Toolbar = new ToolbarClass(d);
}

class ToolbarClass {
	constructor(dParent) {
		this.dParent = dParent;
		clearElement(dParent);
		this.buttons = {};
		this.populate();

	}
	addButton(key, handler, caption) {
		if (nundef(caption)) caption = key;
		let styles = { w: 100 };
		let b = this.buttons[key] = mButton(caption, handler, this.dParent, styles, null, 'b_' + key);
	}
	removeButton() { }
	showButton() { }
	hideButton() { }
	populate() {
		this.addButton('uploadBoard', onClickUploadBoard, 'upload board');
		this.addButton('uploadPerlen', onClickUploadPerlen, 'upload perlen');

		mLinebreak(this.dParent)
		this.addButton('chooseBoard', onClickChooseBoard, 'choose board');
		this.addButton('prefabGallery', onClickPrefabGallery, 'prefab gallery');
		this.addButton('modifyLayout', onClickModifyLayout, 'modify layout');
		this.addButton('saveAsPrefab', onClickSaveAsPrefab, 'save as prefab');

		//perle pool changes:
		mLinebreak(this.dParent);
		let oldCode = false;
		if (oldCode) {
			this.addButton('clearBoard', onClickClearBoard, 'clear board');
			this.addButton('clearPerlenpool', onClickClearPerlenpool, 'clear perlenpool');
			this.addButton('remove5Random', onClickRemove5Random, 'remove 5 random');
			// this.addButton('resetAll', onClickResetAll, 'reset all perlen');
			mLinebreak(this.dParent);
			this.addButton('addToPool', onClickAddToPool, 'add to pool');
			// this.addButton('addToPool',onClickAddToPool,'add to pool');
			this.addButton('add5Random', onClickAdd5Random, 'add 5 random');
		}else{
			this.addButton('perlenPool', onClickPerlenPool, 'perlen pool');
		}

		// this.addButton('saveLastState',onClickSaveLastState,'save gamestate');
		// this.addButton('retrieveLastState',onClickRetrieveLastState,'retrieve gamestate');
		// this.addButton('saveToHistory',onClickSaveToHistory,'save to history');
		// mLinebreak(this.dParent)

		mLinebreak(this.dParent);
		this.addButton('recovery', onClickRecovery, 'recovery!!!');
		this.addButton('recpoint', onClickRecpoint, 'recpoint!');
		mLinebreak(this.dParent);

		// mLinebreak(this.dParent);
		// this.addButton('saveColor', onClickSaveColor, '&nbsp;save&nbsp; color');
		// this.addButton('retrieveColor', onClickRetrieveColor, 'retrieve color');
		// this.addButton('showSavedColor', onClickShowSavedColor, 'show color');
		mLinebreak(this.dParent)
		this.addButton('saveSettings', onClickSaveSettings, 'save settings');
		this.addButton('retrieveSettings', onClickRetrieveSettings, 'retrieve settings');
		// this.addButton('showSavedSettings', onClickShowSavedSettings, 'show settings');
		mLinebreak(this.dParent);
		this.addButton('saveState', onClickSaveState, 'save gamestate');
		this.addButton('retrieveState', onClickRetrieveState, 'retrieve gamestate');
		// this.addButton('showSavedState', onClickShowSavedState, 'show gamestate');
	}
}










