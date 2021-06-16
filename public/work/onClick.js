var ActiveButton = null;

function onClickPerlenPool(ev){
	let button = ev.target;
	if (ActiveButton == button) { doPerlenPoolChanges(); return; }

	openAux('perlen pool', button);
	let wWidget = 380;
	let styles = { w: wWidget, align: 'center', margin: 6 };
	let defOptions = {nAdd:5,nRemove:5,clearBoard:false,justRandom:true};
	if (nundef(G.perlenOptions)) G.perlenOptions = {};
	let s = G.perlenOptions;
	copyKeys(defOptions,s);
	let dp = mBy('dAuxContent');
	let inpAddRandom = mEditRange('add: ', s.nAdd, 1, 20, 1, dp, (a) => { s.nAdd = a;  }, styles);
	let inpRemove = mEditRange('remove: ', s.nRemove, 1, 20, 1, dp, (a) => { s.nRemove = a;  }, styles);
	let inpClearBoard = mCheckbox('clear board: ', s.clearBoard, dp, (a) => { s.clearBoard = a; }, styles);
	let inpClearPool = mCheckbox('clear pool: ', s.clearPool, dp, (a) => { s.clearPool = a; }, styles);
	let inpOnlyRandom = mCheckbox('just random: ', s.justRandom, dp, (a) => { s.justRandom = a; }, styles);

}
function doPerlenPoolChanges(){
	//using G.perlenOptions
	let s=G.perlenOptions;
	// mit poolChange sollte alles auf einmal executed werden!!!
	console.log('options:',s);
	Socket.emit('perlenOptions',s);

}

function openAux(title, button) {
	resetActiveButton();
	show(dAux);
	clearElement(dAuxContent);
	dAuxTitle.innerHTML = title;
	if (isdef(button)) setActiveButton(button);
}
function closeAux() {
	resetActiveButton();
	hide(dAux);
}
function resetActiveButton() {
	if (ActiveButton != null) {
		//console.log(ActiveButton);
		//cancel active thing
		//console.log(ActiveButton, ActiveButton.id)
		let ba = ActiveButton;
		mStyleX(ba, { bg: 'white', fg: 'black' });
		let caption = ba.id.substring(2);

		caption = separateAtCapitals(caption);
		ba.innerHTML = caption;
		ActiveButton = null;
	} else {
		//console.log('ActiveButton is null!!!')
	}
}
function setActiveButton(button) {
	ActiveButton = button;
	mStyleX(button, { bg: 'dimgray', fg: 'white' });
	button.innerHTML = 'submit command!';
}
function onClickToolbarButton() {
	if (isVisible('sidebar')) {
		hide('sidebar');
		mStyleX(dTable, { w: 'calc( 100% - 120 )' });
	} else {
		show('sidebar');
		mStyleX(dTable, { w: '100%' });
	}
}

//#region upload perlen or boards
function onClickUploadBoard(ev) {
	//hier gib das zeug vom anderen hin!

	openAux('upload board image');
	let form1 = new FileUploadForm(dAuxContent, 'Upload Board Image', 'bretter',
		filename => {
			if (!filename) console.log('cancel!');
			else console.log('file ' + filename + ' uploaded successfully!');
			closeAux();
		});
}
function onClickUploadPerlen() {
	//hier gib das zeug vom anderen hin!
	openAux('upload perlen images');
	let form1 = new FileUploadForm(dAuxContent, 'Upload Perlen Images', 'perlen',
		filename => {
			if (!filename) console.log('cancel!')
			else console.log('file ' + filename + ' uploaded successfully!');
			closeAux();
		});
}
//#endregion

//#lastState old code
function onClickSaveLastState() {
	let lastStateSaved = G.lastStateman.save(G, true);
	let s = lastStateSaved.settings;
	console.log('save baseColor', s.baseColor);
	// console.log('saved lastState','board',s.boardFilename,'baseColor',s.baseColor,'field color',s.fieldColor);
	// console.log('state saved',lastStateSaved.settings.boardFilename,lastStateSaved.randomIndices.length);
}
function onClickRetrieveLastState() {
	//das sollte reset sein!
	let lastState = G.lastStateman.getLastStateSaved();
	// console.log('retrieved lastState',lastState);
	let s = lastState.settings;
	console.log('retrieve baseColor', s.baseColor);
	// console.log('retrieved lastState','board',s.boardFilename,'baseColor',s.baseColor,'field color',s.fieldColor);

	Socket.emit('initLastState', { lastState: lastState });
	return;
	let elem = createElementFromHTML(`
		<form action="/lastState" method="post" enctype="multipart/form-data">
		<input type="file" name="lastState" placeholder="Select file" />
		<br />
		<button>Upload</button>
		</form>
	`);
	show(dAux);
	clearElement(dAuxContent);
	mAppend(dAuxContent, elem);
}
function onClickSaveToHistory() {
	console.log('save to history!');
	let l = G.lastStateman.lastState;
	downloadAsYaml(l, 'lastState');
}
//#endregion

//#region board options
function onClickBoardInChooseBoard(boardFilename) {
	if (boardFilename == G.settings.boardFilename) return;
	G.settings.boardFilename = boardFilename;
	Socket.emit('settings', { settings: G.settings });
}
function onClickChooseBoard() {
	openAux('click board to select');
	let boards = G.settings.boardFilenames;
	//console.log(boards);
	for (const b of boards) {
		let img = mImg(PERLENPATH_FRONT + 'bretter/' + b, dAuxContent, { cursor: 'pointer', h: 200, margin: 8, 'vertical-align': 'baseline' });
		img.onclick = () => { closeAux(); onClickBoardInChooseBoard(b); } //G.chooseBoard(b); }
	}
	//add empty frame for empty
	let img = mDiv(dAuxContent, { cursor: 'pointer', display: 'inline-block', border: 'black', w: 300, h: 200, margin: 8, box: true });
	img.onclick = () => { closeAux(); onClickBoardInChooseBoard('none'); } //G.chooseBoard('none'); }
}
function onClickPrefabGallery() {
	openAux('choose board + layout');
	let standards = DB.standardSettings;
	let boardExamples = {};
	for (const stdName in standards) {
		let std = standards[stdName];
		let d = mDiv(dAuxContent, { margin: 10, cursor: 'pointer' });
		addKeys(G.settings, std);
		//console.log('std',std,'\nG.settings',G.settings);
		//break;

		let b = applyStandard(d, std, 200, 100);

		boardExamples[stdName] = {
			key: stdName,
			board: b,
			settings: std,
			//colorPicker: b.colorPicker,
			dParent: d,

		}
		d.onclick = () => {
			DA.lastPrefabName = stdName;
			copyKeys(std, G.settings);
			Socket.emit('settings', { settings: G.settings });
			closeAux();
		}
	}
	//console.log(boardExamples);
}
function onClickActivateLayout() { closeAux(); Socket.emit('settings', { settings: G.settings }); }
function onClickModifyLayout(ev) {

	let button = ev.target;
	if (ActiveButton == button) { onClickActivateLayout(); return; }

	openAux('board settings', button);
	let wWidget = 380;
	let [s, b] = [G.settings, G.clientBoard];
	let styles = { w: wWidget, align: 'center', margin: 6 };
	let inpRows = mEditRange('rows: ', s.rows, 1, 20, 1, dAuxContent, (a) => { setApply('rows', a) }, styles);
	let inpCols = mEditRange('cols: ', s.cols, 1, 20, 1, dAuxContent, (a) => { setApply('cols', a) }, styles);
	let inpXOffset = mEditRange('x-offset: ', s.boardMarginLeft, -100, 100, 1, dAuxContent, (a) => { setApply('boardMarginLeft', a) }, styles);
	let inpYOffset = mEditRange('y-offset: ', s.boardMarginTop, -100, 100, 1, dAuxContent, (a) => { setApply('boardMarginTop', a) }, styles);
	let inpRot = mEditRange('rotation: ', s.boardRotation, 0, 90, 1, dAuxContent, (a) => { setApply('boardRotation', a) }, styles);
	mLinebreak(dAuxContent);
	let inpWidth = mEditRange('center dx: ', s.dxCenter, 10, 200, 1, dAuxContent, (a) => { setApply('dxCenter', a) }, styles);
	let inpHeight = mEditRange('center dy: ', s.dyCenter, 10, 200, 1, dAuxContent, (a) => { setApply('dyCenter', a) }, styles);
	let inpFieldSize = mEditRange('field size: ', s.szField, 10, 200, 1, dAuxContent, (a) => { setApply('szField', a) }, styles);
	mLinebreak(dAuxContent);

	let inpSzPerle = mEditRange('perle %: ', s.szPerle, 50, 125, 1, dAuxContent, (a) => { setApply('szPerle', a) }, styles);

	let inpszPoolPerle = mEditRange('pool perle: ', s.szPoolPerle, 40, 140, 1, dAuxContent, (a) => { setApply('szPoolPerle', a) }, styles);
	let inpDimming = mEditRange('dimming %: ', s.dimming, 0, 100, 1, dAuxContent, (a) => { setApply('dimming', a) }, styles);

	mLinebreak(dAuxContent);

	let inpFieldColor = mColorPickerControl('field color: ', s.fieldColor, b.img, dAuxContent, (a) => { setApply('fieldColor', a) }, styles);
	console.log('basecolor', s.baseColor);
	let inpBaseColor = mColorPickerControl('background: ', s.baseColor, b.img, dAuxContent, (a) => { setApply('baseColor', a) }, styles);
	// let inpBaseColor = mColorPickerControl('background: ', s.baseColor, b.img, dAuxContent, (a)=>{setNewBackgroundColor(a);s.baseColor = a;}, styles);
	let inpFullCover = mCheckbox('complete rows: ', s.boardLayout == 'hex1' ? false : true, dAuxContent,
		(a) => {
			setApply('boardLayout', a ? 'hex' : 'hex1');
			//console.log('a', a)
		}, styles);
	let inpfreeForm = mCheckbox('free drop: ', s.freeForm ? true : false, dAuxContent, (a) => { setApply('freeForm', a == 1 ? true : false) }, styles);
}
function onClickSaveAsPrefab() {
	let prefabName = prompt('enter name: ', DA.lastPrefabName);
	Socket.emit('prefab', { name: prefabName, settings: G.settings });
	closeAux();

}
//#endregion

function onClickClearPerlenpool() {
	closeAux();
	G.clearPoolUI();
	Socket.emit('clearPoolarr');
}

//#region old code to be dep
function onClickClearBoard() { 
	closeAux(); 
	let [plist, fields] = G.clearBoardUI();
	console.log('sending remove all perlen command', plist, fields);
	console.log('===> remove list', plist, fields);
	let data = { iPerlen: plist.map(x => x.index), iFroms: fields.map(x => x.index), username: Username };
	logClientSend('removePerlen', data);
	Socket.emit('removePerlen', data);
}

function onClickClearAllPerlen() {
	closeAux();
	G.clearBoardUI();
	G.clearPoolUI();
	Socket.emit('clearPool');

	//perlen im pool werden destroyed
	//die am board bleiben
}
function onClickAddToPool(ev) {

	let button = ev.target;
	if (ActiveButton == button) { //submit!
		if (isdef(DA.selectedPerlen) && !isEmpty(DA.selectedPerlen)) {
			let keys = DA.selectedPerlen.map(x => x.key);
			//console.log('send poolChange!!!')
			Socket.emit('poolChange', { keys: keys });
			delete DA.selectedPerlen;
		}
		closeAux();
		return;
	}
	openAux('pick perlen', button);
	let d = mDiv(dAuxContent);
	let items = [];
	for (const k in G.perlenDict) {
		let p = jsCopy(G.perlenDict[k]);
		p.path = mPath(p);
		console.log('path', p.path)
		//if (!(p.path.includes('.'))) p.path +='.png';
		//if (k=='adherent' || k=='fringe') console.log(p.path,p)
		let ui = createPerle(p, d, 64, 1.3, .4);
		mStyleX(ui, { opacity: 1 });
		iAdd(p, { div: ui });
		items.push(p);
	}
	DA.selectedPerlen = [];
	items.map(x => iDiv(x).onclick = ev => { toggleItemSelection(x, DA.selectedPerlen) });


}
function onClickAdd5Random() {
	closeAux();
	Socket.emit('poolChange', { n: 5 });
}
function onClickRemove5Random() {
	closeAux();
	Socket.emit('removeRandom', { n: 5 });
}
function onClickResetAll() {
	Socket.emit('reset');
}
//#endregion

//#region saveColor retrieveColor
function onClickSaveColor() {
	localStorage.setItem('background', G.settings.baseColor);
	console.log('saved baseColor', G.settings.baseColor);
}
function onClickRetrieveColor() {
	let color = localStorage.getItem('background');
	console.log('retrieved baseColor', color);
	G.settings.baseColor = color;
	Socket.emit('settings', { settings: G.settings });
}
function onClickShowSavedColor() {
	let color = localStorage.getItem('background');
	console.log('saved background is', color);
}
//#endregion

function onClickSaveSettings() {
	localStorage.setItem('settings', JSON.stringify(G.settings));
	console.log('saved settings (baseColor)', G.settings.baseColor);
}
function onClickRetrieveSettings() {
	let settings = localStorage.getItem('settings');
	if (isdef(settings)) {
		settings = JSON.parse(settings);
		console.log('retrieved settings (baseColor)', settings.baseColor);
		G.settings = settings;
		Socket.emit('settings', { settings: G.settings });
	} else {
		console.log('no settings in localStorage!');
	}
}
function onClickShowSavedSettings() {
	let settings = localStorage.getItem('settings');
	if (isdef(settings)) {
		settings = JSON.parse(settings);
		console.log('saved settings (baseColor)', settings.baseColor);
	} else {
		console.log('no settings in localStorage!');
	}
}
function saveStateAndSettings() {
	onClickSaveState();
	console.assert(BaseColor == G.settings.baseColor, 'Colors do NOT match at saving state!!!')
	onClickSaveSettings();
	//onClickSaveColor();
}
function recoverStateAndSettings() {
	//retrieve state,color and settings
	onClickRetrieveState();
	let settings = localStorage.getItem('settings');
	if (isdef(settings)) {
		settings = JSON.parse(settings);
		console.log('retrieved settings (baseColor)', settings.baseColor);
		G.settings = settings;
		// let color = localStorage.getItem('background');
		// console.log('got color',color)
		// if (isdef(color)) {
		// 	//color=JSON.parse(color);
		// 	console.log('retrieved baseColor', color);
		// 	G.settings.baseColor = color;
		// }
		Socket.emit('settings', { settings: G.settings });
	} else {
		console.log('no settings in localStorage!');
	}
}
function onClickSaveState() {
	let st = G.state;
	let state = { boardArr: st.boardArr, poolArr: st.poolArr, pool: {} };
	for (const k in st.pool) {
		let oNew = state.pool[k] = {};
		copyKeys(st.pool[k], oNew, {}, ['index', 'key']);
	}
	localStorage.setItem('state', JSON.stringify(state));
	localStorage.setItem('randomIndices', JSON.stringify(G.randomIndices));
	console.log('saved state (boardArr)', state.boardArr.filter(x => x !== null));
	console.log('saved state (pool)', Object.keys(state.pool));
}
function onClickRetrieveState() {
	let state = localStorage.getItem('state');
	let randomIndices = localStorage.getItem('randomIndices');
	if (isdef(state) && isdef(randomIndices)) {
		state = JSON.parse(state);
		randomIndices = JSON.parse(randomIndices);
		console.log('retrieved state (boardArr)', state.boardArr.filter(x => x !== null));
		Socket.emit('state', { state: state, randomIndices: randomIndices });
	} else {
		console.log('no state/randomIndices in localStorage!');
	}
}
function onClickShowSavedState() {
	let state = localStorage.getItem('state');
	let randomIndices = localStorage.getItem('randomIndices');
	if (isdef(state) && isdef(randomIndices)) {
		state = JSON.parse(state);
		randomIndices = JSON.parse(randomIndices);
		console.log('retrieved state (boardArr)', state.boardArr.filter(x => x !== null));
		// Socket.emit('state', { state:state,randomIndices:randomIndices });
	} else {
		console.log('no state/randomIndices in localStorage!');
	}
}

function onClickRecovery() { recoverStateAndSettings(); }
function onClickRecpoint() { saveStateAndSettings(); }
//#region helpers TODO => base
//function addMagnifyOnHover(ui,)
function mAddBehavior(ui, beh, params) {
	switch (beh) {
		case 'magnifyOnHover': addMagnifyOnHover(ui, ...params); break;
		case 'selectOnClick': addSelectOnClick(ui, ...params); break;
	}
}
function selectTextOrig(id) {
	var sel, range;
	var el = document.getElementById(id); //get element id
	if (window.getSelection && document.createRange) { //Browser compatibility
		sel = window.getSelection();
		if (sel.toString() == '') { //no text selection
			window.setTimeout(function () {
				range = document.createRange(); //range object
				range.selectNodeContents(el); //sets Range
				sel.removeAllRanges(); //remove all ranges from selection
				sel.addRange(range);//add Range to a Selection.
			}, 1);
		}
	} else if (document.selection) { //older ie
		sel = document.selection.createRange();
		if (sel.text == '') { //no text selection
			range = document.body.createTextRange();//Creates TextRange object
			range.moveToElementText(el);//sets Range
			range.select(); //make selection.
		}
	}
}
function setApply(prop, val) {
	let s = G.settings;
	if (isNumber(val)) val = Number(val); //if (val === true || val === false)
	s[prop] = val;
	G.clientBoard = applySettings(G.clientBoard, s);
}
function unCamelCase(s) { return separateAtCapitals(s); }
function unCamel(s) { return separateAtCapitals(s); }
function separateAtCapitals(s) {
	let sNew = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (ch.toUpperCase() != ch) sNew += ch;
		else sNew += ' ' + ch.toLowerCase();
	}
	return sNew;
}
//#endregion

