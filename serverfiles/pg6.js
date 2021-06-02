//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var MessageCounter = 0;
var Verbose = true;

//#endregion
const NO_LAST_STATE = false;
class GP2 {
	constructor(io, perlenDict, DB, lastState) {
		this.io = io;
		this.perlenDict = perlenDict;
		this.db = DB;
		this.settings = base.jsCopy(DB.games.gPerlen2);
		//console.log('settings',this.settings)
		this.state = {};

		if (NO_LAST_STATE || base.nundef(lastState)) lastState = { settings: {}, state: {} };
		this.initState(lastState.state, lastState.settings);

		this.players = {};

		this.clients = {};
	}
	initState(state, settings) {

		console.log(state.pool)

		base.copyKeys(state, this.state);
		base.copyKeys(settings, this.settings);


		// console.log('settings', this.settings);
		if (base.isdef(state.pool)) {
			console.log('state', state.pool);
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
	addPerle(key, client) {
		console.assert(key == key.toLowerCase(), 'FILENAME CASING!!!!');
		let emitPool = false, savePerlen = false;
		let perle;
		if (!(key in this.perlenDict)) { emitPool = true; savePerlen = true; perle = addToPerlenDict(key); }
		else perle = PerlenDict[key];

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
	getPlayerNames() { return Object.values(this.players).map(x => x.username); }
	handleBoard(client, x) {
		if ('boardFilename' in x) { this.settings.boardFilename = x.boardFilename; }
		if ('nFields' in x) { this.state.boardArr = new Array(x.nFields); }
		this.safeEmitState(['settings']);
	}
	handlePerlenImages(client, x) {
		let pack = x.pack;
		let emitPool = false;
		for (const key in pack) {
			let p = pack[key];
			if (p.type == 'perlenName') {
				//console.log('got',key)
				let p = base.firstCondDict(this.state.pool, x => x.key == key);
				if (!p) {
					//console.log('NEU!')
					base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
					this.maxPoolIndex += 1;
					emitPool = true;
				}
			} else if (p.type == 'imageData') {
				try {
					let fullPath;
					let isTesting = key == 'aaa';
					let filename = base.stringBefore(p.filename, '.').toLowerCase();
					if (isTesting) { fullPath = path.join(__dirname, filename + '.png'); console.log('...fake saving file', fullPath); return; }
					fullPath = path.join(__dirname, '../public/assets/games/perlen/perlen/' + filename + '.png')
					let imgData = decodeBase64Image(p.data);
					fs.writeFile(fullPath, imgData.data,
						function () {
							//console.log('...images saved:', fullPath);
							emitPool = emitPool || this.addPerle(key, client);		// add perle!
						});
				}
				catch (error) {
					console.log('ERROR:', error);
				}

			}
		}
		let sz = Object.keys(this.state.pool).length; console.log('==>pool', sz);
		this.safeEmitState(['pool', 'perlenDict'])
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
function savePerlenDictToFile() {
	utils.toYamlFile(PerlenDict, path.join(__dirname, '../public/perlenDict.yaml'));
}
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logReceive(type,) { MessageCounter++; log('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send', ...arguments); }


module.exports = {
	GP2
}
