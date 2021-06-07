//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var MessageCounter = 0;
const PerlenPath = '../public/PERLENDATA/';

//#endregion
var Verbose = false;
const NO_LAST_STATE = false;
class GP2 {
	constructor(io, perlenDict, DB, lastState) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.db = DB;
		this.settings = base.jsCopy(DB.games.gPerlen2);

		if (NO_LAST_STATE || base.nundef(lastState)) lastState = { settings: {}, state: {} };
		this.lastState = lastState;
		base.copyKeys(lastState.settings, this.settings);

		//initialize settings.boardFilenames from directory!
		utils.getFilenames(path.join(__dirname, PerlenPath + 'bretter'),
			filenames => {
				let s = this.settings;
				s.boardFilenames = filenames;
				if (s.boardFilename != 'none' && !(filenames.includes(s.boardFilename))) {
					//eg., this file has been deleted!
					console.log('board file deleted!!!! =>replacing board!', s.boardFilename);
					this.lastState.boardFilename = s.boardFilename = filenames[0];
				}
				this.weiter();
			});
	}
	weiter() {
		let s = this.settings, lastState = this.lastState;
		if (Verbose) console.log('boards', this.settings.boardFilenames);
		//console.log('settings',this.settings)
		this.state = {};

		this.initState(lastState.state, lastState.settings);

		this.players = {};

		this.clients = {};
	}
	initState(state, settings) {
		//console.log(state.pool)
		base.copyKeys(state, this.state);
		base.copyKeys(settings, this.settings);
		// console.log('settings', this.settings);
		if (base.isdef(state.pool)) {
			//console.log('state', state.pool);
			this.maxPoolIndex = Object.keys(state.pool).length;
		} else {
			this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);
			this.state.boardArr = [];
		}
	}
	addPlayer(client, x) {
		let username = x;
		let id = client.id;
		log('add player', username, id)
		this.clients[id] = client;
		let pl = { id: id, username: username };
		this.players[id] = pl;
		return pl;
	}
	addPerle(key) {
		console.assert(key == key.toLowerCase(), 'FILENAME CASING!!!!');
		let emitPool = false, savePerlen = false;
		let perle;
		if (!(key in this.perlenDict)) {
			emitPool = true;
			savePerlen = true;
			perle = {
				text: base.stringBefore(key, '.'),
				key: base.stringBefore(key, '.'),
				path: key,
			};
			this.perlenDict[key] = perle;
		}
		else perle = this.perlenDict[key];

		console.assert(base.isdef(perle), 'KEINE PERLE!!!!!!!!!!!!!! ' + key);

		let p = base.firstCondDict(this.state.pool, x => x.key == key);
		if (!p) {
			base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
			this.maxPoolIndex += 1;
			emitPool = true;
		}
		if (savePerlen) { savePerlenDictToFile(); }
		return emitPool;
	}
	addBoard(filename){
		this.settings.boardFilenames.push(filename);
		this.safeEmitState(['settings']);

	}
	getPlayerNames() { return Object.values(this.players).map(x => x.username); }
	handlePlayerLeft(client, x) {
		logReceive('playerLeft', client.id);
		let id = client.id;
		let players = this.players;
		delete players[id];
		delete this.clients[id];
		delete this.players[id];
	}
	handleStartOrJoin(client, x) {
		logReceive('startOrJoin', client.id)
		let pl = this.addPlayer(client, x);
		logSend('gameState');
		if (this.settings.poolSelection != 'random') {
			this.safeEmitState(['perlenDict', 'settings', 'pool'], { instruction: 'pick your set of pearls!' }, client);
		} else {
			this.safeEmitState(['perlenDict', 'settings', 'pool'], null, client);
		}
		this.sendMessage(pl.username, `user ${pl.username} joined! (players:${this.getPlayerNames().join()})`);
	}
	handleReset(client, x) {
		logReceive('reset', client.id);
		//choice:
		//1. clear boardArr, put alle perlen zurueck in stall
		//==>2. clear boardArr, reset pool to new pool
		let barr = this.state.boardArr;

		if (base.isdef(barr)) { this.state.boardArr = new Array(barr.length); }

		delete this.state.poolArr;
		delete this.state.pool;

		this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);
		logSend('gameState');
		if (this.settings.poolSelection != 'random') {
			this.safeEmitState(['perlenDict', 'settings', 'pool'], { instruction: 'pick your set of pearls!' });
		} else {
			this.safeEmitState(['perlenDict', 'settings', 'pool']);
		}
	}
	handleMovePerle(client, x) {
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		let iTo = x.iTo;
		let username = x.username;
		let state = this.state;
		let perle = state.pool[iPerle];

		//update board state!
		let boardArr = this.state.boardArr;
		boardArr[iFrom] = null;
		boardArr[iTo] = iPerle;

		this.state.boardArr = boardArr;

		if (base.isdef(x.displaced)) {
			// console.log('DDDDDDDDDDDDDDDDDDIS')
			this.state.poolArr.unshift(x.displaced);
		}

		this.safeEmitState();
	}
	handlePlacePerle(client, x) {
		//console.log('x', x, 'this.state', this.state);
		let iPerle = x.iPerle;
		let iField = x.iField;
		let username = x.username;
		let state = this.state;
		let perle = state.pool[iPerle];

		base.removeInPlace(state.poolArr, iPerle);
		if (base.isdef(x.displaced)) { state.poolArr.unshift(x.displaced); }

		state.boardArr[iField] = iPerle;

		this.safeEmitState();

	}
	handleRemovePerle(client, x) {
		logReceive('removePerle', x);
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		//let state = this.state;

		this.state.boardArr[iFrom] = null;//update board state!
		this.state.poolArr.unshift(iPerle);

		//console.log('poolArr', this.state.poolArr);

		this.safeEmitState();
	}

	handleNewBoard(client, x){
		this.settings.boardFilename = x.boardFilename;
		this.safeEmitState(['settings']);
	}
	handleSyncBoardLayout(client, x) {
		logReceive('syncBoardLayout', x);
		console.log('HANDLE BOARD', x)
		if ('boardFilename' in x) { this.settings.boardFilename = x.boardFilename; }
		if ('nFields' in x) { this.state.boardArr = new Array(x.nFields); }
		if ('rows' in x) { this.settings.rows = x.rows; }
		if ('cols' in x) { this.settings.cols = x.cols; }
		if ('layout' in x) { this.settings.layout = x.layout; }
		this.safeEmitState(['settings']);
	}

	sendMessage(username, msg) { this.io.emit('userMessage', { username: username, msg: msg }); }
	safeEmitState(keys, eMore, client) {

		if (base.nundef(keys)) keys = [];
		let o = { state: { boardArr: this.state.boardArr, poolArr: this.state.poolArr } };
		if (keys.includes('settings')) o.settings = this.settings;
		if (keys.includes('pool')) o.state.pool = this.state.pool;
		if (keys.includes('perlenDict')) o.perlenDict = this.perlenDict;
		if (base.isdef(eMore)) base.copyKeys(eMore, o);

		let lastState = base.jsCopy(this.settings);
		delete lastState.boardFilenames;
		if (!NO_LAST_STATE) utils.toYamlFile({ settings: lastState, state: this.state }, path.join(__dirname, PerlenPath + 'lastState.yaml'));

		if (base.isdef(client)) client.emit('gameState', o); else this.io.emit('gameState', o);

	}

}



//#region helpers

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
function savePerlenDictToFile() {
	utils.toYamlFile(PerlenDict, path.join(__dirname, PerlenPath + 'perlenDict.yaml'));
}
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logReceive(type,) { MessageCounter++; log('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send', ...arguments); }


module.exports = {
	GP2
}
