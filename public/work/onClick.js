function onClickUploadBoard() {
	//hier gib das zeug vom anderen hin!
	show(dAux);
	clearElement(dAux);
	let form1 = new FileUploadForm(dAux, 'Upload Board Image', 'bretter',
		filename => {
			if (!filename) console.log('cancel!')
			else console.log('file ' + filename + ' uploaded successfully!');
			hide(dAux);
		});
}
function onClickUploadPerlen() {
	//hier gib das zeug vom anderen hin!
	show(dAux); clearElement(dAux); //mStyleX(dAux,{wmin:'30%'});
	let form1 = new FileUploadForm(dAux, 'Upload Perlen Images', 'perlen',
		filename => {
			if (!filename) console.log('cancel!')
			else console.log('file ' + filename + ' uploaded successfully!');
			hide(dAux);
		});
}
function onClickChooseBoard() {
	show(dAux);
	clearElement(dAux);
	mDiv(dAux, {}, null, '<h1>click board to select!</h1>');
	let boards = G.settings.boardFilenames;
	console.log(boards);
	for (const b of boards) {
		let img = mImg(PERLENPATH_FRONT + 'bretter/' + b, dAux, { h: 200, margin: 8, 'vertical-align': 'baseline' });
		img.onclick = () => { hide(dAux); G.chooseBoard(b); }
	}
	//add empty frame for empty
	let img = mDiv(dAux, { display: 'inline-block', border: 'black', w: 300, h: 200, margin: 8, box: true });
	img.onclick = () => { hide(dAux); G.chooseBoard('none'); }
}

function onClickChooseLayout() {
	show(dAux); clearElement(dAux); mDiv(dAux, {}, null, '<h1>choose layout of fields on board</h1>');
	let standards = DB.standardSettings;
	console.log(standards);
	for (const stdName in standards) {
		let std = standards[stdName];
		let d = mDiv(dAux);
		addKeys(G.settings, std);
		//console.log('std',std,'\nG.settings',G.settings);
		//break;
		applyStandard(d, std);
		//break;
		// let img = mImg(PERLENPATH_FRONT + 'bretter/' + b, dAux, { h: 200, margin: 8, 'vertical-align': 'baseline' });
		// img.onclick = () => { hide(dAux); G.chooseBoard(b); }
	}
	//add empty frame for empty
	// let img = mDiv(dAux, { display: 'inline-block', border: 'black', w: 300, h: 200, margin: 8, box: true });
	// img.onclick = () => { hide(dAux); G.chooseBoard('none'); }
}


