//#region requires, const, var
const base = require('../../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('../../serverfiles/utils.js');
var MessageCounter = 0;
var Verbose = false;
var G;
var DB;
var PerlenDict;

//#endregion

class GP2 {
	constructor(io, perlenDict, settings, state) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.players = {};
		this.settings = settings;
		this.initState(settings, state);
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
		// let p = base.jsCopy(perle);
		let index = this.maxIndex;
		this.maxIndex += 1;
		let p = this.byIndex[index] = { key: perle.path, index: index };
		if (base.isdef(this.State.poolArr)) this.State.poolArr.push(index); //addToPoolArr(poolPerle.index);

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

		if (base.isdef(moreData)) copyKeys(modeData, o);
		if (base.isdef(client)) client.emit('gameState', o); else this.io.emit('gameState', o);

	}
	getNumActivePlayers() { return this.state.players.length; }
	getNumPlayers() { return Object.keys(this.players).length; }
	getPlayerNames() { return this.State.players.map(x => x.name).join(','); }
	getPlayerState(plid) { return base.firstCond(this.State.players, x => x.id == plid); }
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
		if (base.nundef(this.State.players)) this.State.players = [];
		this.State.players.push(plState);
		//console.log('added player',pl.id)
		return pl;
	}
	initPlayers() { this.State.players = []; for (const plid in this.players) { this.initPlayerState(plid); } }
	initBoardTraditional(settings) {
		let [rows, cols] = [base.valf(settings.rows, 4), base.valf(settings.cols, 4)];
		// let arr = new Array(rows * cols);
		return { rows: rows, cols: cols, nFields: rows * cols };
	}
	initBoardImage(settings) {
		let filename = settings.filename; //'brett02cropped.png'; // [base.valf(settings.rows, 4), base.valf(settings.cols, 4)];
		let name = base.stringBefore(filename, '.');
		let info = settings.bretter[name];
		let nums = base.allNumbers(info);
		let algo = base.stringAfter(info, ' ');
		//let N = settings.N=nums[0];
		// let arr = new Array(nums[0]);
		//let arr = new Array(rows * cols);
		return { filename: filename, algo: algo, nFields: nums[0] };
	}
	initState(settings, state) {
		if (base.isdef(settings)) base.copyKeys(settings, this.settings);
		let byIndex = this.byIndex = {}; this.maxIndex = 0; this.State = {};

		console.log('_initState: settings:', this.settings)

		let board = this.board = this.settings.IsTraditionalBoard ? this.initBoardTraditional(this.settings)
			: this.initBoardImage(this.settings);

		let numInitPerlen = this.settings.individualSelection ? this.settings.M : this.settings.N;
		let keys = getRandomPerlenKeys(numInitPerlen);
		//keys[0]='chillax';
		//keys[1]='carelessness';
		keys.map(x => this.addToPool(this.perlenDict[x]));

		//console.log('byIndex',keys);
		//let n=board.nFields;

		this.State = base.isdef(state) ? state
			: {
				board: board,
				boardArr: new Array(board.nFields),
				poolArr: Object.values(byIndex).map(x => x.index),
				pool: byIndex,
			};

		this.initPlayers();
		let n = keys.length;
		console.log('==>there are ', n, 'perlen');//, '\npool', byIndex);
	}
	initialPoolDone(client, x) {
		let pl = this.players[client.id];
		pl.isInitialized = true;
		this.updatePlayerState(pl);
	}
	sendInitialOrState(client){
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
		if (plState) base.removeInPlace(this.State.players, plState);
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

		if (base.isdef(x.displaced)) {
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

		base.removeInPlace(state.poolArr, iPerle);
		if (base.isdef(x.displaced)) { state.poolArr.unshift(x.displaced); }

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
		let plState = base.firstCond(this.State.players, x => x.id == pl.id);
		plState.isInitialized = pl.isInitialized;
	}
}

//#region interface
function addPerle(filename, client) {

	//filename = base.stringBefore(filename,'.').toLowerCase();
	//console.log('==>adding perle for', filename);
	console.assert(filename == filename.toLowerCase(), 'FILENAME CASING!!!!');

	// if this filename is already present in pool, do NOT add it again!!!
	let emitPool = false, savePerlen = false;
	//not in PerlenDict => not in pool!
	let perle;
	if (perleNichtInPerlenDict(filename)) { emitPool = true; savePerlen = true; perle = addToPerlenDict(filename); }
	else perle = PerlenDict[filename];

	console.assert(base.isdef(perle), 'KEINE PERLE!!!!!!!!!!!!!! ' + filename);

	addIfNotInPool(client, filename);
	if (savePerlen) { savePerlenDictToFile(); }
}
function addIfNotInPool(client, filename) {
	let poolPerle = G.getPerleByFilename(filename);
	//console.log('pool perle', poolPerle);
	if (poolPerle == null) {
		poolPerle = G.addToPool(PerlenDict[filename]);
		this.safeEmitState(true, true, false, true);
		//G.emitGameStateIncludingPool(client);
	}
	else { console.assert(base.isdef(G.State.pool[poolPerle.index]), 'ASSERT SCHON IN POOL NICHT IN POOL!!!'); }
}
function handleAddToPool(client, x) {
	//console.log('SHORTCUT!',x.name)
	addIfNotInPool(client, x.name);

}
function handleImage(client, x) {
	try {
		let isTesting = x.filename == 'aaa';
		let filename = base.stringBefore(x.filename, '.').toLowerCase();

		let fullPath;
		if (isTesting) { fullPath = path.join(__dirname, filename + '.png'); console.log('...fake saving file', fullPath); return; }

		fullPath = path.join(__dirname, '../public/assets/games/perlen/perlen/' + filename + '.png')
		let imgData = decodeBase64Image(x.data);
		fs.writeFile(fullPath, imgData.data,
			function () {
				//console.log('...images saved:', fullPath);
				addPerle(filename, client);		// add perle!
			});
	}
	catch (error) {
		console.log('ERROR:', error);
	}
}
function handleMovePerle(client, x) { G.playerMovesPerle(client, x); }
function handlePlayerLeft(client, x) { G.playerLeft(client, x); }
function handlePlacePerle(client, x) { G.playerPlacesPerle(client, x); }
function handleRelayout(client, x) { G.boardLayoutChange(client, x); }
function handleRemovePerle(client, x) { G.playerRemovesPerle(client, x); }
function handleReset(client, x) { G.playerReset(client, x); }
function handleStartOrJoin(client, x) { G.playerJoins(client, x); }
function handleInitialPoolDone(client, x) { G.initialPoolDone(client, x); }
function initPerlenGame(IO, perlenDict, db, lastState) {
	//console.log(' *** Settings only here ***');
	//settings soll von DB.games kommen!
	//wenn es lastState gibt, nimm lastState
	DB = db;
	PerlenDict = perlenDict;
	let settings = DB.games.gPerlen2;
	if (base.isdef(lastState)) {
		settings = lastState.settings;
		state = lastState.state;
	}
	G = new GP2(IO, perlenDict, settings, state);
}

//#region helpers
function addToPerlenDict(filename) {
	let perle = {
		Name: filename,
		path: filename,
		Update: base.formatDate(),
		Created: base.formatDate(),
		"Fe Tags": '',
		"Wala Tags": '',
		"Ma Tags": ''
	};
	PerlenDict[filename] = perle;
	return perle;
}
function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	var response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = Buffer.from(matches[2], 'base64');

	return response;
}
function getRandomPerlenKeys(n) { return base.choose(Object.keys(PerlenDict), n); }
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logBroadcast(type) { MessageCounter++; log('#' + MessageCounter, 'broadcast ' + type); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send ' + type); }
function logReceive(type) { MessageCounter++; log('#' + MessageCounter, 'receive ' + type); }
function perleNichtInPerlenDict(filename) { return base.nundef(PerlenDict[filename]); }
function savePerlenDictToFile() {
	utils.toYamlFile(PerlenDict, path.join(__dirname, '../public/perlenDict.yaml'));
}

//#endregion



module.exports = {
	addPerle, initPerlenGame,
	handleAddToPool, handleImage, handleInitialPoolDone, handleMovePerle, handlePlacePerle, handlePlayerLeft,
	handleRelayout, handleRemovePerle, handleReset,
	handleStartOrJoin,
}
