//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var MessageCounter = 0;
var Verbose = true;

//#endregion
const NO_LAST_STATE = true;
class GP2 {
	constructor(io, perlenDict, DB, lastState) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.db = DB;
		this.settings = base.jsCopy(DB.games.gPerlen2);
		//console.log('settings',this.settings)
		this.state = {};

		if (NO_LAST_STATE) lastState={settings:{},state:{}};
		this.initState(lastState.state, lastState.settings);

		this.players = {};

		this.clients = {};
	}
	initState(state, settings) {
		base.copyKeys(state, this.state);
		base.copyKeys(settings, this.settings);
		// console.log('settings', this.settings);
		this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);

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
	getPlayerNames() { return Object.values(this.players).map(x => x.username); }
	handleBoard(client, x) {
		if ('boardFilename' in x) { this.settings.boardFilename = x.boardFilename; }
		if ('nFields' in x) { this.state.boardArr = new Array(x.nFields); }
		this.safeEmitState(['settings']);
	}
	handleAddToPool(client, x) {
		//console.log('SHORTCUT!',x.name)
		let key = x.path;
		let p = base.firstCondDict(this.state.pool, x => x.key == key);
		if (!p) {
			base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
			this.maxPoolIndex += 1;
			this.safeEmitState(['pool']);
		}
	}
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
		//choice:
		//1. clear boardArr, put alle perlen zurueck in stall
		//==>2. clear boardArr, reset pool to new pool
		let barr = this.state.boardArr;
		if (base.isdef(barr)) { this.state.boardArr = new Array(barr.length); }
		this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);
		logSend('gameState');
		if (this.settings.poolSelection != 'random') {
			this.safeEmitState(['perlenDict', 'settings', 'pool'], { instruction: 'pick your set of pearls!' }, client);
		} else {
			this.safeEmitState(['perlenDict', 'settings', 'pool'], null, client);
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
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		let state = this.state;

		state.boardArr[iFrom] = null;//update board state!
		state.poolArr.unshift(iPerle);
		let pl = this.players[client.id];

		this.safeEmitState();
	}
	sendMessage(username, msg) { this.io.emit('userMessage', { username: username, msg: msg }); }
	safeEmitState(keys, eMore, client) {

		if (base.nundef(keys)) keys = [];
		//complete reconstructable state is: poolArr,boardArr,settings,pool
		//minimal state is: poolArr, boardArr
		//das board layout is in settings!

		//board extensibility deprecated!
		//console.log('state', this.state)
		let o = { state: { boardArr: this.state.boardArr, poolArr: this.state.poolArr } };
		if (keys.includes('settings')) o.settings = this.settings;
		if (keys.includes('pool')) o.state.pool = this.state.pool;
		if (keys.includes('perlenDict')) o.perlenDict = this.perlenDict;
		if (base.isdef(eMore)) base.copyKeys(eMore, o);

		if (!NO_LAST_STATE) utils.toYamlFile({ settings: this.settings, state: this.state }, './lastState.yaml');

		if (base.isdef(client)) client.emit('gameState', o); else this.io.emit('gameState', o);

	}

}

//#region helpers
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logReceive(type,) { MessageCounter++; log('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send', ...arguments); }


module.exports = {
	GP2
}
