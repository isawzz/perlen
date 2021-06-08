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

		let b = applyStandard(d, std, 400);

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

function setAndTest(s, b, prop, val) {
	s[prop] = val;
	console.log('result', s);

	clearElement(G.dParent);
	//copyKeys(s,G.settings);
	G.clientBoard = applyStandard(G.dParent, G.settings);


}
function setApply(prop, val) {
	console.log('hallo!', prop, val);
	// return;
	if (isNumber(val)) val = Number(val);
	let s = G.settings;
	s[prop] = val;
	clearElement(G.dParent);
	G.clientBoard = applyStandard(G.dParent, s);
}
function onClickEditLayout() {
	openAux('Settings');
	let [s, b] = [G.settings, G.clientBoard];
	let styles = { w: 300, align: 'center', hmargin: 20, vmargin: 6, bg: 'green' };
	let inpRows = mEditRange('rows: ', s.rows, 1, 20, 1, dAuxContent, (a) => { setApply('rows', a) }, styles);
	let inpCols = mEditRange('cols: ', s.cols, 1, 20, 1, dAuxContent, (a) => { setApply('cols', a) }, styles);
	let inpRot = mEditRange('rotation: ', s.boardRotation, 0, 90, 1, dAuxContent, (a) => { setApply('boardRotation', a) }, styles);
	let inpWidth = mEditRange('width: ', s.wField, 10, 200, 2, dAuxContent, (a) => { setApply('wField', a) }, styles);
	let inpHeight = mEditRange('height: ', s.hField, 10, 200, 2, dAuxContent, (a) => { setApply('hField', a) }, styles);
	// let inpRows1=mEdit('rows: ', s.rows, dAuxContent,(a)=>{setAndTest(s,b,'rows',Number(a))}, styles);
	// let inpCols=mEdit('cols: ', s.cols, dAuxContent,(a)=>{setAndTest(s,b,'cols',Number(a))}, styles);
	// let inpRot=mEditNumber('rotation: ', s.boardRotation, dAuxContent,(a)=>{setAndTest(s,b,'boardRotation',Number(a))}, styles);
	//let inpRows=mEdit('rows: ', s.rows, dAuxContent, {maleft:50});
}
function onClickPublishLayout(){
	openAux('enter name for prefab');
	Socket.emit('settings',{settings:G.settings});
}

