function createClientBoard(dParent, settings) {//filename, layout, wCell = 140, hCell = 140, wgap = 20, hgap=20) {

	let [filename, layout, wCell, hCell, wGap, hGap] = [settings.boardFilename, settings.boardLayout, settings.wField, settings.hField, settings.wGap, settings.hGap];

	let dOuter = mDiv(dParent, { display: 'inline-block', position:'relative' }, 'dBoardOuter');
	let img, wOuter, hOuter;
	if (filename != 'none') {
		let path = './assets/games/perlen/bretter/' + filename + '.png';
		img = mImg(path, dOuter);
		[wOuter, hOuter] = [img.naturalWidth, img.naturalHeight];
	} else[wOuter, hOuter] = [1000, 600];
	mStyleX(dOuter, { w: wOuter, h: hOuter }); //full board size!!!

	// dInner: inner div that completely covers image
	let dInner = mDiv(dOuter, { left:0,top:0,w:wOuter,h:hOuter,position:'absolute' }, 'dBoardInner');//,'background-image':path });
	let clientBoard = { div: dOuter, dInner: dInner, img: img };
	mCenterCenterFlex(dInner);

	// dArea: area for fields: positioned in the center of dInner
	let [wArea, hArea] = [Math.min(wOuter, 800), Math.min(hOuter, 800)];
	let dArea = mDiv(dInner, { w: wArea, h: hArea }, 'dFieldArea'); //, bg:'blue'
	mCenterCenterFlex(dArea);

	let [w, h] = [wArea, hArea];

	console.log('layout', layout);
	let isHexLayout = startsWith(layout, 'hex');
	let hline = isHexLayout ? hCell * .75 : hCell;
	//console.log('hline', hline)

	let rows, cols;
	if (isdef(settings.rows)) rows = settings.rows; else rows = Math.floor(h / hline);
	if (isdef(settings.cols)) cols = settings.cols; else cols = Math.floor(w / wCell)

	if (isHexLayout && rows * hline + hCell / 4 > h) rows -= 1;

	let boardShouldHaveCenter = true;
	if (rows % 2 == 0 && boardShouldHaveCenter) rows -= 1;
	if (cols % 2 == 0 && boardShouldHaveCenter) cols -= 1;

	//console.log('rows,cols', rows, cols);
	let [centers, wTotal, hTotal] = getCentersFromRowsCols(layout, rows, cols, wCell, hCell);
	console.log('centers', centers, '\n dims', wTotal, hTotal);

	// dCells: this is where actually fields are! also needs to be centered in dArea
	let dCells = mDiv(dArea,{w:wTotal,h:hTotal,position:'relative'}); //, bg:'green'});
	//dArea size also needs to be adjusted to at least that size!!!
	mStyleX(dArea,{w:Math.max(wArea,wTotal),h:Math.max(hArea,hTotal)});

	let fields;
	if (isdef(centers)) fields = createFieldsFromCenters(dCells,clientBoard, centers, wCell, hCell, wGap, hGap, wTotal, hTotal);
	let bg = valf(settings.fieldColor, colorTrans('black', .3));
	fields.map(x => mStyleX(iDiv(x), { bg: bg }));

	return clientBoard;
}


class FakeServerClass {
	constructor(io, perlenDict, settings, state) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.settings = {};
		this.state = {};
		this.initState(state, settings);
		this.players = {};
	}
	initState(state, settings) {
		base.copyKeys(state, this.state);
		base.copyKeys(settings, this.settings);
		//console.log(this.settings)
		this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);

	}
	initStateOld(settings, state) {
		if (isdef(settings)) copyKeys(settings, this.settings);
		let byIndex = this.byIndex = {}; this.maxIndex = 0; this.State = state;

		//console.log('_initState: settings:', this.settings)

		if (nundef(state)) {
			state = this.State = {};
			let board = state.board = createServerBoard();
			state.boardArr = [];// new Array(board.nFields);
			//console.log('board', board);

			state.pool = byIndex;
			state.poolArr = [];
			let keys = createServerPoolKeys();
			keys.map(x => this.addToPool(this.perlenDict[x]));
			//console.log('byIndex', keys);

		}
		this.initPlayers();

		//console.log('==>there are ', Object.keys(this.State.pool).length, 'perlen');//, '\npool', byIndex);
	}
	addPlayer(client, x) {
		let username = x;
		let id = client.id;
		//console.log('adding player', id);
		let pl = { id: id, client: client, name: username, username: username, arr: [] };
		this.players[id] = pl;
		this.initPlayerState(pl.id);
		return pl;
	}
	addToPool(perle) {
		// let p = jsCopy(perle);
		let index = this.maxIndex;
		this.maxIndex += 1;
		let p = this.byIndex[index] = { key: perle.path, index: index };
		if (isdef(this.State.poolArr)) this.State.poolArr.push(index); //addToPoolArr(poolPerle.index);

		return p;
	}
	boardLayoutChange(client, x) {
		//update board state!
		let state = this.State;
		state.boardArr = x.boardArr;
		state.poolArr = x.poolArr;
		state.board = { rows: x.rows, cols: x.cols };
		this.safeEmitState(false, false, false, true);
	}
	safeEmitState(emitSettings, emitPool, emitPerlenDict, emitBoardLayout, client, moreData) {

		//console.log('hallo');
		let o = { state: { boardArr: this.State.boardArr, poolArr: this.State.poolArr } };
		if (emitSettings) o.settings = this.settings;
		if (emitPool) o.state.pool = this.State.pool;
		if (emitPerlenDict) o.perlenDict = this.perlenDict;
		if (emitBoardLayout) o.state.board = this.board;
		//console.log('hallo2');

		DB.tables.perlen = this.State;
		//console.log('hallo3', DB.tables.perlen);

		utils.toYamlFile({ settings: this.settings, state: this.State }, './lastState.yaml');
		//console.log('hallo4');

		if (isdef(moreData)) copyKeys(modeData, o);
		if (isdef(client)) client.emit('gameState', o); else this.io.emit('gameState', o);

	}
	getNumActivePlayers() { return this.state.players.length; }
	getNumPlayers() { return Object.keys(this.players).length; }
	getPlayerNames() { return this.State.players.map(x => x.name).join(','); }
	getPlayerState(plid) { return firstCond(this.State.players, x => x.id == plid); }
	getPerleByFilename(filename) {
		for (const k in this.byIndex) {
			let p = this.byIndex[k];
			if (p.path == filename) return p;
		}
		return null;
	}
	getPerlenName(iPerle) { return this.byIndex[iPerle].Name; }
	getTurn() { return this.state.turn; }
	initPlayerState(plid) {
		//console.log('initPlayerState', plid)
		let pl = this.players[plid];
		pl.arr = [];
		pl.isInitialized = false;
		let plState = { id: pl.id, name: pl.name, username: pl.username, arr: pl.arr, isInitialized: pl.isInitializes };
		//console.log('state', plState);
		if (nundef(this.State.players)) this.State.players = [];
		this.State.players.push(plState);
		//console.log('added player',pl.id)
		return pl;
	}
	initPlayers() { this.State.players = []; for (const plid in this.players) { this.initPlayerState(plid); } }
	initBoardTraditional(settings) {
		let [rows, cols] = [valf(settings.rows, 4), valf(settings.cols, 4)];
		// let arr = new Array(rows * cols);
		return { rows: rows, cols: cols, nFields: rows * cols };
	}
	initBoardImage(settings) {
		let filename = settings.filename; //'brett02cropped.png'; // [valf(settings.rows, 4), valf(settings.cols, 4)];
		let name = stringBefore(filename, '.');
		let info = settings.bretter[name];
		let nums = allNumbers(info);
		let algo = stringAfter(info, ' ');
		//let N = settings.N=nums[0];
		// let arr = new Array(nums[0]);
		//let arr = new Array(rows * cols);
		return { filename: filename, algo: algo, nFields: nums[0] };
	}
	initialPoolDone(client, x) {
		let pl = this.players[client.id];
		pl.isInitialized = true;
		this.updatePlayerState(pl);
	}
	sendInitialOrState(client) {
		if (this.settings.individualSelection) {
			let data = { state: this.State, perlenDict: this.perlenDict, instruction: 'pick your set of pearls!' };
			client.emit('initialPool', data);
		} else {
			logSend('gameState');
			this.safeEmitState(true, true, true, true, client);
		}
	}
	playerJoins(client, x) {
		let pl = this.addPlayer(client, x);
		this.sendInitialOrState(client);
		this.io.emit('userMessage', {
			username: x,
			msg: `user ${pl.name} joined! (players:${this.getPlayerNames()})`,
		});

	}
	playerLeft(client, data) {
		let id = client.id;
		let players = this.players;
		delete players[id];
		let plState = this.getPlayerState(id);
		if (plState) removeInPlace(this.State.players, plState);
		//console.log('player left: ', client.id, data);
	}
	playerMovesPerle(client, x) {
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		let iTo = x.iTo;
		let username = x.username;
		let perle = this.byIndex[iPerle];

		//update board state!
		let boardArr = this.State.boardArr;
		boardArr[iFrom] = null;
		boardArr[iTo] = iPerle;

		this.State.boardArr = boardArr;

		if (isdef(x.displaced)) {
			// console.log('DDDDDDDDDDDDDDDDDDIS')
			this.State.poolArr.unshift(x.displaced);
		}

		this.safeEmitState(false, false, false, false);
	}
	playerPlacesPerle(client, x) {
		//console.log('x', x, 'this.State', this.State);
		let iPerle = x.iPerle;
		let iField = x.iField;
		let username = x.username;
		let state = this.State;
		let perle = state.pool[iPerle];

		removeInPlace(state.poolArr, iPerle);
		if (isdef(x.displaced)) { state.poolArr.unshift(x.displaced); }

		state.boardArr[iField] = iPerle;

		this.safeEmitState(false, false, false, false);

	}
	playerRemovesPerle(client, x) {
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		let state = this.State;

		state.boardArr[iFrom] = null;//update board state!
		state.poolArr.unshift(iPerle);
		let pl = this.players[client.id];

		this.safeEmitState(false, false, false, false);
	}
	playerReset(client, x) {
		this.initState(x.settings);
		let username = x.username;
		this.sendInitialOrState(client);
	}
	updatePlayerState(pl) {
		let plState = firstCond(this.State.players, x => x.id == pl.id);
		plState.isInitialized = pl.isInitialized;
	}
}


function createFakeState() {
	let settings = DB.games.gPerlen2;
	let fakeServer = new FakeServerClass(Socket, PerlenDict, settings, null);
	let state = fakeServer.State;
	return { settings: settings, state: state, perlenDict: PerlenDict };



}

function getRandomPerlenKeys(n) { return choose(Object.keys(PerlenDict), n); }
