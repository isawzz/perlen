function openAux(title) {
	show(dAux); clearElement(dAuxContent);
	dAuxTitle.innerHTML = title;
}

function onClickUploadBoard() {
	//hier gib das zeug vom anderen hin!
	openAux('upload board image');
	let form1 = new FileUploadForm(dAuxContent, 'Upload Board Image', 'bretter',
		filename => {
			if (!filename) console.log('cancel!')
			else console.log('file ' + filename + ' uploaded successfully!');
			hide(dAux);
		});
}
function onClickUploadPerlen() {
	//hier gib das zeug vom anderen hin!
	openAux('upload perlen images');
	let form1 = new FileUploadForm(dAuxContent, 'Upload Perlen Images', 'perlen',
		filename => {
			if (!filename) console.log('cancel!')
			else console.log('file ' + filename + ' uploaded successfully!');
			hide(dAux);
		});
}
function onClickChooseBoard() {
	openAux('click board to select');
	let boards = G.settings.boardFilenames;
	//console.log(boards);
	for (const b of boards) {
		let img = mImg(PERLENPATH_FRONT + 'bretter/' + b, dAuxContent, { h: 200, margin: 8, 'vertical-align': 'baseline' });
		img.onclick = () => { hide(dAux); G.chooseBoard(b); }
	}
	//add empty frame for empty
	let img = mDiv(dAuxContent, { display: 'inline-block', border: 'black', w: 300, h: 200, margin: 8, box: true });
	img.onclick = () => { hide(dAux); G.chooseBoard('none'); }
}
function onClickPrefabGallery() {
	openAux('choose board + layout');
	let standards = DB.standardSettings;
	let boardExamples = {};
	for (const stdName in standards) {
		let std = standards[stdName];
		let d = mDiv(dAuxContent, { margin: 10 });
		addKeys(G.settings, std);
		//console.log('std',std,'\nG.settings',G.settings);
		//break;

		let b = applyStandard(d, std, 200, 100);

		boardExamples[stdName] = {
			key: stdName,
			board: b,
			settings: std,
			colorPicker: b.colorPicker,
			dParent: d,

		}
	}
	console.log(boardExamples);
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
	//console.log('hallo!', prop, val);
	// return;
	if (isNumber(val)) val = Number(val);
	let s = G.settings;
	s[prop] = val;
	//clearElement(G.dParent);
	G.clientBoard = applySettings(G.clientBoard, s);
}
function calcFieldGaps(sz) {
	sz = Number(sz);
	let s = G.settings;
	s.wGap = s.wField - sz;
	s.hGap = s.hField - sz;
	//clearElement(G.dParent);
	G.clientBoard = applySettings(G.cleantBoard, s);
}
function onClickEditLayout() {
	openAux('board settings');
	let wWidget = 350;
	let [s, b] = [G.settings, G.clientBoard];
	let styles = { w: wWidget, align: 'center', hmargin: 20, vmargin: 6 };
	let inpRows = mEditRange('rows: ', s.rows, 1, 20, 1, dAuxContent, (a) => { setApply('rows', a) }, styles);
	let inpCols = mEditRange('cols: ', s.cols, 1, 20, 1, dAuxContent, (a) => { setApply('cols', a) }, styles);
	let inpRot = mEditRange('rotation: ', s.boardRotation, 0, 90, 1, dAuxContent, (a) => { setApply('boardRotation', a) }, styles);
	let inpWidth = mEditRange('width: ', s.wField, 10, 200, 1, dAuxContent, (a) => { setApply('wField', a) }, styles);
	let inpHeight = mEditRange('height: ', s.hField, 10, 200, 1, dAuxContent, (a) => { setApply('hField', a) }, styles);
	let inpXOffset = mEditRange('x-offset: ', s.boardMarginLeft, -100, 100, 1, dAuxContent, (a) => { setApply('boardMarginLeft', a) }, styles);
	let inpYOffset = mEditRange('y-offset: ', s.boardMarginTop, -100, 100, 1, dAuxContent, (a) => { setApply('boardMarginTop', a) }, styles);
	let inpFieldSize = mEditRange('field size: ', s.wField - s.wGap, 10, 200, 1, dAuxContent, (a) => { calcFieldGaps(a) }, styles);
	let inpFieldColor = mColorPickerControl('field color: ', s.fieldColor, b.img, dAuxContent, (a) => { setApply('fieldColor', a) }, styles);
	let inpBaseColor = mColorPickerControl('background: ', s.baseColor, b.img, dAuxContent, setNewBackgroundColor, styles);
}

function onClickActivateLayout() {
	//openAux('enter name for prefab');
	//G.createPoolDiv();
	Socket.emit('settings', { settings: G.settings });
}

function onClickClearPerlenpool(){
	//perlen im pool werden destroyed
	//die am board bleiben
}
function onClickClearBoard(){

}
function onClickClearAllPerlen(){
	//perlen im pool werden destroyed
	//die am board bleiben
}
function onClickAddToPool(){

}

function onClickReset() {
	//sendReset(isdef(G) ? G.settings : DB.games.gPerlen2.settings);

}

