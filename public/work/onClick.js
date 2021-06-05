function closeBoardEditor() { closePerlenEditor(); }
function openBoardEditor() { createBoardEditor(); }
function openPerlenEditor() { createPerlenEditor(); }

function openSettings() { onClickSettings(); }
function onClickSettings() {
	show("dSettingsWindow");
	//console.log('settings', G.settings)
	let settingsView = Settings = new PerlenSettingsClass(G.settings, mBy('dSettingsWindow'), U);
	settingsView.createSettingsUi();
}
function onClickSetSettings() {
	console.log('Settings', Settings, '\nG.settings', G.settings)
	let s = G.settings;
	let changed = Settings.haveChanged;
	let propsChanged = changed.map(x => arrLast(x));

	let hasChanged = Settings.hasChanged;
	if (!Settings.hasChanged) {
		console.log('NOTHING HAS BEEN CHANGED!!!!!');
		return;
	}
	console.log('changed settings:', propsChanged);

	if (propsChanged.includes('boardFilename')) {
		console.log('boardFilenames', s.boardFilenames);
		let fpure = getFilename(s.boardFilename, false);
		console.log('fpure', fpure);
		let found = firstCond(s.boardFilenames, x => x.includes(fpure));
		console.log('found', found);

		//let fileObject = s.boardFilename_file;
		//delete s.boardFilename_file;
		let imgFile = Settings.imgFile;

		if (!found && isdef(imgFile.data)) {
			uploadImgData(imgFile);
			return;
			// //need to upload this file!!!!!!!!!
			// //after uploading, need to remove it from G.settings!!!!!!!
			// let pack = { settings: s, nFields: s.nFields, data: imgFile.data, filename: s.boardFilename };
			// sendSettingsWithBoardImage(pack);
		}
	}
}
function onClickSetSettings1() {
	console.log('Settings', Settings, '\nG.settings', G.settings)
	let s = G.settings;
	let changed = Settings.haveChanged;
	let propsChanged = changed.map(x => arrLast(x));

	let hasChanged = Settings.hasChanged;
	if (!Settings.hasChanged) {
		console.log('NOTHING HAS BEEN CHANGED!!!!!');
		return;
	}
	console.log('changed settings:', propsChanged);

	if (propsChanged.includes('boardFilename')) {
		console.log('boardFilenames', s.boardFilenames);
		let fpure = getFilename(s.boardFilename, false);
		console.log('fpure', fpure);
		let found = firstCond(s.boardFilenames, x => x.includes(fpure));
		console.log('found', found);

		//let fileObject = s.boardFilename_file;
		//delete s.boardFilename_file;
		let imgFile = Settings.imgFile;

		if (!found && isdef(imgFile.data)) {
			//need to upload this file!!!!!!!!!
			//after uploading, need to remove it from G.settings!!!!!!!
			let pack = { settings: s, nFields: s.nFields, data: imgFile.data, filename: s.boardFilename };
			sendSettingsWithBoardImage(pack);
			// var img = document.createElement("img");
			// mAppend(dTable,img);
			// var reader = new FileReader();
			// reader.onload = e=> {
			// 	console.log('loaded!!!')
			// 	img.src = e.target.result;
			// 	imgFile.data = e.target.result; //img.toDataURL("image/png");
			// 	let data = imgFile.data;
			// 	let filename = imgFile.name;
			// 	console.log('filename', filename);
			// 	// let s1={};
			// 	// copyKeys(s,s1,{boardFilename_file:true,boardFilenames:true});
			// 	// delete s.boardFilename_file;

			// }
			// reader.readAsDataURL(imgFile);

			return;
		}
	}//else{
	sendSettings(s);
	//}
	//
}
function onClickCloseSettings() { closeSettings(); }
function closeSettings() { hide("dSettingsWindow"); }

function onClickReset() {
	sendReset(isdef(G) ? G.settings : DB.games.gPerlen2.settings);
}

//#region initToolbar alles unbrauchbar!
function initToolbar(settings) {
	let bSelect = mBy('dPreselectButton');
	if (!settings.individualSelection) { closePerlenEditor(); turnButtonOff(bSelect); } else { turnButtonOn(bSelect); }
	let bHex = mBy('dBoardSwitchButton');
	if (settings.IsTraditionalBoard) { turnButtonOff(bHex); } else { turnButtonOn(bHex); }
}
function turnButtonOn(b) { mStyleX(b, { bg: '#ffff0080', rounding: '50%' }); }
function turnButtonOff(b) { mStyleX(b, { bg: '#33333340' }); }
function onClickPreselect(b) {
	G.settings.individualSelection = !G.settings.individualSelection;
	let bSelect = mBy('dPreselectButton');
	if (!G.settings.individualSelection) { closePerlenEditor(); turnButtonOff(bSelect); } else { turnButtonOn(bSelect); }
	sendReset({ individualSelection: G.settings.individualSelection, IsTraditionalBoard: G.settings.IsTraditionalBoard });
}
function onClickBoardSwitch(b) {
	G.settings.IsTraditionalBoard = !G.settings.IsTraditionalBoard;
	let bHex = mBy('dBoardSwitchButton');
	if (G.settings.IsTraditionalBoard) { turnButtonOff(bHex); } else { turnButtonOn(bHex); }
	sendReset({ individualSelection: G.settings.individualSelection, IsTraditionalBoard: G.settings.IsTraditionalBoard });
}
//#endregion

//#region ************* old code **************** */

function onClickFreezer2(ev) {
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); auxOpen = false;
	startUnit();
}
function onClickGear() {
	openAux();
	hide('dGear');
	hide('dCalibrate');
	Settings.createSettingsUi(dAux);
}
function onClickTemple() {
	openAux();
	hide('dTemple');
	createMenuUi(dAux);
}
function onClickMenuItem(ev) { onClickGo(ev); }

function onClickGo(ev) {
	if (isVisible('dTemple')) {
		closeAux();
		if (G.controllerType == 'solitaire') GC.startGame(); else GC.activateUi();
	} else {
		let item = isdef(ev) ? evToItemC(ev) : null;
		let gKey = nundef(ev) ? SelectedMenuKey : isString(ev) ? ev : item.id; // divKeyFromEv(ev);
		if (gKey != SelectedMenuKey) {
			if (isdef(SelectedMenuKey)) toggleItemSelection(Items[SelectedMenuKey]);
			SelectedMenuKey = gKey;
			let item = Items[SelectedMenuKey];
			toggleItemSelection(item);
		} else {
			closeAux();
			setGame(gKey);
			GC.startGame();
		}
	}
}

//#region helpers
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain); //console.log('TOMain cleared')
	//clearTimeout(TOLong); console.log('TOLong cleared')
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function closeAux() {
	hide(dAux);
	hide('dGo');
	show('dGear');
	show('dTemple');
	if (Settings.hasChanged) { Settings.updateSettings(); dbSave('boardGames'); }
	Settings.hasChanged = false;
	auxOpen = false;
}
function interrupt() {
	//console.log('iiiiiiiiiiiiiiiiiiiiiiii')
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts(); //legacy
	if (isdef(G.clear)) G.clear();
	TOMan.clear();
}
function openAux() { interrupt(); show(dAux); show('dGo'); }
//#endregion