//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
const { SkipInitialSelect, IsTraditionalBoard } = require('../public/BASE/globals.js');
var MessageCounter = 0;
var Verbose = false;
var G;
var PerlenDict;

//#endregion

class GP2 {
	constructor(io, perlenDict, settings) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.players = {};
		this.settings = settings;

		this.initState(settings);
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
		let p = base.jsCopy(perle);
		p.index = this.maxIndex;
		this.maxIndex += 1;
		this.byIndex[p.index] = p;
		if (base.isdef(this.State.poolArr)) this.State.poolArr.push(p.index); //addToPoolArr(poolPerle.index);

		return p;
	}
	boardLayoutChange(client, x) {
		//update board state!
		let state = this.State;
		state.boardArr = x.boardArr;
		state.poolArr = x.poolArr;
		state.rows = x.rows;
		state.cols = x.cols;
		this.io.emit('gameState',
			{
				state: {
					boardArr: x.boardArr,
					poolArr: x.poolArr,
					rows: x.rows,
					cols: x.cols,
				}, username: x.username, msg: 'user ' + x.username + ' modified board'
			});

	}
	emitPartialGameState(client) {

	}
	emitInitial(client) {
		let pl = this.players[client.id];
		let username = pl.name;
		//console.log('username', username);
		if (this.settings.SkipInitialSelect) {
			logSend('gameState');
			this.io.emit('gameState', { settings: this.settings, state: this.State, username: username });
		} else {
			let data = { state: this.State, instruction: 'pick your set of pearls!' };
			this.io.emit('initialPool', data); // { state: this.State, username: username });
			//client.emit('initialPool', data);// { state: { pool: State.pool }, instruction: 'pick your set!' });
		}
	}
	emitGameStateIncludingPool(client) {
		let pl = this.players[client.id];
		let username = pl.name;
		//console.log('username', username);
		this.io.emit('gameState', { settings: this.settings, state: this.State, username: username });
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
		let arr = new Array(rows * cols);
		return { rows: rows, cols: cols, arr: arr };
	}
	initBoardImage(settings) {
		let filename = 'brett02cropped.png'; // [base.valf(settings.rows, 4), base.valf(settings.cols, 4)];
		let arr = new Array(26);
		//let arr = new Array(rows * cols);
		return { filename: filename, arr: arr };
	}

	initState(settings) {
		if (base.isdef(settings)) base.copyKeys(settings, this.settings); else settings = this.settings;
		console.log('_initState: settings:', settings)
		let byIndex = this.byIndex = {}; this.maxIndex = 0; this.State = {};

		let board = this.board = this.settings.IsTraditionalBoard ? this.initBoardTraditional(settings)
			: this.initBoardImage(settings);

		let numInitPerlen = this.settings.SkipInitialSelect ? 50 : 10;
		let keys = getRandomPerlenKeys(base.valf(this.settings.N, numInitPerlen));
		//keys[0]='chillax';
		//keys[1]='carelessness';
		keys.map(x => this.addToPool(this.perlenDict[x]));

		//console.log('byIndex',keys);
		this.State = {
			board: board,
			rows: board.rows,
			cols: board.cols,
			boardArr: board.arr,
			poolArr: Object.values(byIndex).map(x => x.index),
			pool: byIndex,
		};

		this.initPlayers();
		let n = keys.length;
		console.log('==>there are ', n, 'perlen');
	}
	initialPoolDone(client, x) {
		let pl = this.players[client.id];
		pl.isInitialized = true;
		this.updatePlayerState(pl);
	}
	playerJoins(client, x) {
		let pl = this.addPlayer(client, x);
		//console.log('join:', pl.isInitialized);
		//console.log('hallo', x, 'starts or joins game!');


		if (this.settings.SkipInitialSelect) {
			logSend('gameState');
			client.emit('gameState', { settings: this.settings, state: this.State, perlenDict: this.perlenDict });
		} else {
			let data = { state: this.State, perlenDict: this.perlenDict, instruction: 'pick your set of pearls!' };
			client.emit('initialPool', data);// { state: { pool: State.pool }, instruction: 'pick your set!' });
		}
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


		this.io.emit('gameState',
			{
				state: {
					rows: this.State.rows,
					cols: this.State.cols,
					boardArr: this.State.boardArr,
					poolArr: this.State.poolArr,
				}, username: username, msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iTo
			});


	}

	playerPlacesPerle(client, x) {
		let iPerle = x.iPerle;
		let iField = x.iField;
		let username = x.username;
		let state = this.State;
		let perle = state.pool[iPerle];

		base.removeInPlace(state.poolArr, iPerle);
		if (base.isdef(x.displaced)) { state.poolArr.unshift(x.displaced); }

		state.boardArr[iField] = iPerle;

		this.io.emit('gameState', {
			state: { rows: state.rows, cols: state.cols, boardArr: state.boardArr, poolArr: state.poolArr },
			username: username,
			msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iField
		});

	}

	playerRemovesPerle(client, x) {
		//console.log('!!!!!!!!!!!!!!', x, this.State.boardArr)
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		let state = this.State;

		state.boardArr[iFrom] = null;//update board state!
		state.poolArr.unshift(iPerle);
		let pl = this.players[client.id];

		// let newState = this.getState(['rows', 'cols', 'boardArr', 'poolArr']);
		let newState = {
			rows: state.rows,
			cols: state.cols,
			boardArr: state.boardArr,
			poolArr: state.poolArr
		};
		//console.log('danch', newState)
		let msg = `user ${pl.name} removed ${this.getPerlenName(iPerle)}`;
		//console.log(msg);
		this.sendGameState(pl, newState, msg);
	}

	playerReset(client, x) {
		console.log('Reset!!!!', x);
		this.initState(x.settings);

		//make sure initState has resetted ALL players to isInitialized = false!
		//console.log('playerstates', this.State.players);

		this.emitInitial(client,x);

	}
	sendInit() {

	}
	sendGameState(pl, newState, msg) {
		let username = pl.username;

		this.io.emit('gameState', {
			state: newState, // { rows: G.State.rows, cols: G.State.cols, boardArr: G.State.boardArr, poolArr: G.State.poolArr, },
			username: username,
			msg: msg,
		});


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
		G.emitGameStateIncludingPool(client);
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
function initPerlenGame(IO, perlenDict) {
	//console.log(' *** Settings only here ***');
	//settings soll von DB.games kommen!
	PerlenDict = perlenDict;
	let settings = {
		rows: 4,
		cols: 4,
		N: 50,
		M: 10,
		filename: 'brett02cropped.png',
		SkipInitialSelect: SkipInitialSelect,
		IsTraditionalBoard: IsTraditionalBoard
	};
	G = new GP2(IO, perlenDict, settings);
	//console.log('players', G.players);
}
function handleMovePerle(client, x) { G.playerMovesPerle(client, x); }
function handlePlayerLeft(client, x) { G.playerLeft(client, x); }
function handlePlacePerle(client, x) { G.playerPlacesPerle(client, x); }
function handleRelayout(client, x) { G.boardLayoutChange(client, x); }
function handleRemovePerle(client, x) { G.playerRemovesPerle(client, x); }
function handleReset(client, x) { G.playerReset(client, x); }
function handleStartOrJoin(client, x) { G.playerJoins(client, x); }

function handleInitialPoolDone(client, x) { G.initialPoolDone(client, x); }

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
