class SettingsClass {

	constructor(settingsObject, userObject, dParent) {
		this.o = settingsObject;
		this.u = userObject;
		this.dParent = dParent;
		//console.log('settings.o:',this.o,'settings.u:',this.u,'settings screen',this.dParent);
		this.haveChanged = [];
		this.isPanelOpen = false;
	}
	//#region settings ui
	updateSettingsPanel(settings) {
		if (isVisible(this.dParent)) this.createSettingsUi();
	}
	close(){
		hide(this.dParent);
		this.isPanelOpen = false;
	}
	createSettingsUi(dParent) {
		this.isPanelOpen = true;
		this.haveChanged = [];
		dParent = valf(dParent, this.dParent);
		console.log('settings screen', dParent)
		clearElement(dParent);
		this.list = [];
		let ttag = 'h2';
		mAppend(dParent, createElementFromHTML(`<${ttag}>Settings for ${this.u.id}:</${ttag}>`));

		let nGroupNumCommonAllGames = this.mInputGroup(dParent);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['samplesPerGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['minutesPerUnit']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['incrementLevelOnPositiveStreak']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['decrementLevelOnNegativeStreak']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], ['toggle', 'always', 'never'], 'toggle', ['pictureLabels']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'language', ['E', 'D', 'S', 'F', 'C'], ['English', 'German', 'Spanish', 'French', 'Chinese'], 'E', ['language']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', Object.keys(KeySets), Object.keys(KeySets), 'best25', ['vocab']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['showTime']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'spoken feedback', true, ['spokenFeedback']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'silent', false, ['silentMode']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after level', false, ['switchGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'trials', 3, ['trials']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show hint', true, ['showHint']);

		//console.log('Settings', this.list)
	}
	setSettingsKeys(elem) {
		let val = elem.type == 'number' ? Number(elem.value) : elem.type == 'checkbox' ? elem.checked : elem.value;
		lookupSetOverride(this.o, elem.keyList, val);
		this.hasChanged = true;
		this.haveChanged.push(elem.keyList);
		//console.log(elem.keyList, val)
		//console.log(this.o);
	}
	setSettingsKeysSelect(elem) {

		let val;
		for (const opt of elem.children) {
			if (opt.selected) val = opt.value;
		}

		// console.log('lllllllllllllllll', a, a.value, a.keyList);
		//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
		this.hasChanged = true;
		this.haveChanged.push(elem.keyList);
		lookupSetOverride(this.o, elem.keyList, val);
		//console.log('result', lookup(this.o, elem.keyList));
	}
	setSettingsKeysSelectPlus(elem) {

		let val;
		for (const opt of elem.children) {
			if (opt.selected) val = opt.value;
		}

		console.log();

		// console.log('lllllllllllllllll', a, a.value, a.keyList);
		//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
		this.hasChanged = true;
		this.haveChanged.push(elem.keyList);
		lookupSetOverride(this.o, elem.keyList, val);

		let key = elem.keyList[0];

		console.log('val',val,'key',key,'elem.value',elem.value)

		//console.log('jetzt muss andere settings von dieser group accordingly setzen!');
		switch (key) {
			case 'boardStandard':
				let data = DB.standardSettings[val];
				if (nundef(data)) { console.log('NO! key', key); return; }
				for (const k in data) { 
					console.log('k',k)
					this.o[k] = data[k]; 
				}
				this.o.boardStandard = val;
				console.log('settings sollen so geaendert werden:', data);
				console.log('G.settings.boardStandard is jetzt',G.settings.boardStandard)

				this.createSettingsUi();
				break;
		}

		//console.log('result', lookup(this.o, elem.keyList));
	}
	setzeEineZahl(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			`<input type="number" class="input" value="${val}" onfocusout="Settings.setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEinenString(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			`<input type="text" class="input" value="${val}" onfocusout="Settings.setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEineCheckbox(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` onfocusout="Settings.setSettingsKeys(this)" >`
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`
		);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEinOptions(dParent, label, optionList, friendlyList, init, skeys) {

		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;

		let inp = createElementFromHTML(`<select class="options" onfocusout="Settings.setSettingsKeysSelect(this)"></select>`);
		for (let i = 0; i < optionList.length; i++) {
			let opt = optionList[i];
			let friendly = friendlyList[i];
			let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
			mAppend(inp, optElem);
			if (opt == val) optElem.selected = true;
		}
		// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEinOptionsPlus(dParent, label, optionList, friendlyList, init, skeys) {

		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;

		let inp = createElementFromHTML(`<select class="options" onfocusout="Settings.setSettingsKeysSelectPlus(this)"></select>`);
		for (let i = 0; i < optionList.length; i++) {
			let opt = optionList[i];
			let friendly = friendlyList[i];
			let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
			mAppend(inp, optElem);
			if (opt == val) optElem.selected = true;
		}
		// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}

	//#region helpers 
	mInputGroup(dParent, styles) {
		let baseStyles = { w: '70%', display: 'inline-block', align: 'right', bg: '#00000080', rounding: 10, padding: 20, margin: 12 };
		if (isdef(styles)) styles = mergeOverride(baseStyles, styles); else styles = baseStyles;
		return mDiv(dParent, styles);
	}
	addSetting(keylist) { if (nundef(this.list)) this.list = []; this.list.push(keylist); }
	updateSettings() {

		this.updateLabelSettings();
		this.updateTimeSettings();
		//updateKeySettings();
		this.updateSpeakmodeSettings();

		//welche settings kommen wohin?
		let scope = 'user';//'game' 'level','temp','all'
		//console.log(Settings)
		if (scope == 'temp' || nundef(this.list)) return;
		for (const k of this.list) {
			if (scope == 'user') lookupSetOverride(U, ['settings', k], this.o[k]);
			else if (scope == 'game') lookupSetOverride(U, ['games', this.o.id, k], this.o[k]);
			else if (scope == 'level') lookupSetOverride(U, ['games', this.o.id, 'levels', this.o.level, k], this.o[k]);
			else if (scope == 'all') lookupSetOverride(DB, ['settings', k], this.o[k]);
		}

	}
	updateSpeakmodeSettings() { if (this.o.silentMode && this.o.spokenFeedback) this.o.spokenFeedback = false; }
	updateTimeSettings() { checkTimer(this.o); }//let timeElem = mBy('time'); if (this.o.showTime) { show(timeElem); startTime(timeElem); } else hide(timeElem); }
	updateLabelSettings() {
		if (this.o.pictureLabels == 'toggle') this.o.showLabels = true;
		else this.o.showLabels = (this.o.pictureLabels == 'always');
		//console.log('labels set to',this.o.showLabels)
	}
	updateGameValues(U) {
		//extracts values for current user and current game from DB
		let game = this.o.id;
		let level = this.o.level;

		let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList }; // general defaults
		settings = mergeOverride(settings, DB.settings);
		if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
		if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
		let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);

		//console.log(settings);
		delete settings.levels;
		delete settings.colors;
		Speech.setLanguage(settings.language);

		copyKeys(settings, this.o);
		this.updateSettings();

		//return settings;

	}

}

class PerlenSettingsClass extends SettingsClass {
	setOtherSettings(elem) {
		console.log('____________elem', elem);
		let val = elem.value;


		let key = elem.keyList[0];

		console.log('val',val,'key',key,'elem.value',elem.value)

		//console.log('jetzt muss andere settings von dieser group accordingly setzen!');
		switch (key) {
			case 'boardStandard':
				let data = DB.standardSettings[val];
				if (nundef(data)) { console.log('NO! key', key); return; }
				for (const k in data) { 
					console.log('k',k)
					this.o[k] = data[k]; 
				}
				this.o.boardStandard = val;
				console.log('settings sollen so geaendert werden:', data);
				this.createSettingsUi();

				break;
		}

	}
	setzeEinActiveOptions(dParent, label, optionList, friendlyList, init, skeys) {

		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = init;

		let inp = createElementFromHTML(`<select class="options" onchange="Settings.setOtherSettings(this)"></select>`);
		for (let i = 0; i < optionList.length; i++) {
			let opt = optionList[i];
			let friendly = friendlyList[i];
			let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
			mAppend(inp, optElem);
			if (opt == val) optElem.selected = true;
		}
		inp.value = val;
		// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });

		inp.keyList = skeys;
		//this.addSetting(skeys[0]);
	}
	setzeEinBrowseFile(dParent, label, init, skeys) {
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;

		let inp = createElementFromHTML(
			`<input type="text" class="input" value="${val}"  />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		var fakeInput = document.createElement("input"); //open file selector when clicked on the drop region
		fakeInput.type = "file";
		fakeInput.accept = "image/*";
		fakeInput.multiple = false;
		inp.onclick = () => { fakeInput.click(); };
		fakeInput.onchange = () => {
			let imgFile = fakeInput.files[0];
			previewBrowsedFile(dTable, imgFile);
			let val = inp.value = getFilename(imgFile.name);
			this.hasChanged = true;
			this.haveChanged.push(skeys);
			this.o[skeys[0]] = val;
			this.imgFile = imgFile;
		};

		mStyleX(inp, { maleft: 12, mabottom: 4, cursor: 'pointer' });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	createSettingsUi() {
		let dParent = mBy('dSettingsContent'); //valf(dParent,this.dParent);
		mCenterFlex(dParent);
		clearElement(dParent);
		this.list = [];

		let fertigSets = DB.standardSettings;
		let fsNames = Object.keys(fertigSets); fsNames.unshift('none');
		let nGroupBoardSettings = this.mInputGroup(dParent);
		this.setzeEinOptions(nGroupBoardSettings, 'base on standard', fsNames, fsNames, 'shapeShifters', ['boardStandard']);
		this.setzeEinOptions(nGroupBoardSettings, 'board layout', ['hex1', 'hex', 'quad', 'circle'], ['hex1', 'hex', 'quad', 'circle'], 'hex1', ['boardLayout']);
		this.setzeEinBrowseFile(nGroupBoardSettings, 'board filename', 'shapeShifters', ['boardFilename']);
		this.setzeEineZahl(nGroupBoardSettings, 'board rotation', 0, ['boardRotation']);
		this.setzeEineZahl(nGroupBoardSettings, 'top margin', 10, ['boardMarginTop']);
		this.setzeEineZahl(nGroupBoardSettings, 'left margin', 20, ['boardMarginLeft']);
		this.setzeEinenString(nGroupBoardSettings, 'field color', 'transparent', ['fieldColor']);
		// this.setzeEinOptions(nGroupNumCommonAllGames, 'field shape', ['circle', 'rectangle', 'hex'], ['circle', 'rectangle', 'hex'], 'circle', ['fieldShape']);
		this.setzeEineZahl(nGroupBoardSettings, 'field width', 100, ['dxCenter']);
		this.setzeEineZahl(nGroupBoardSettings, 'field height', 120, ['dyCenter']);
		this.setzeEineZahl(nGroupBoardSettings, 'horizontal gap', 10, ['wGap']);
		this.setzeEineZahl(nGroupBoardSettings, 'vertical gap', 20, ['hGap']);
		this.setzeEineZahl(nGroupBoardSettings, 'rows', 7, ['rows']);
		this.setzeEineZahl(nGroupBoardSettings, 'columns', 6, ['cols']);
		this.setzeEineZahl(nGroupBoardSettings, 'max width', 800, ['wFieldArea']);
		this.setzeEineZahl(nGroupBoardSettings, 'max height', 800, ['hFieldArea']);

		let nGroupPerlenSettings = this.mInputGroup(dParent);
		this.setzeEinOptions(nGroupPerlenSettings, 'pool selection', ['random', 'mixed', 'player'], ['random', 'mixed', 'never'], 'random', ['poolSelection']);
		this.setzeEineZahl(nGroupPerlenSettings, 'random pool size', 25, ['numPool']);
	}

}
