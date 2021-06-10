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
		if (Verbose) {
			console.log('lastState defined', base.isdef(lastState));
			if (base.isdef(lastState)) console.log(Object.keys(lastState.state.pool).length);
		}
		this.io = io;
		this.perlenDictFull = perlenDict;
		this.db = DB;
		this.settings = base.jsCopy(DB.games.gPerlen2);

		if (NO_LAST_STATE || base.nundef(lastState)) lastState = { settings: {}, state: {} };
		this.lastState = lastState;
		base.copyKeys(lastState.settings, this.settings);

		this.ensureNoDuplicatesInLastState();

		//initialize settings.boardFilenames from directory!
		utils.getFilenames(path.join(__dirname, PerlenPath + 'bretter'),
			filenames => {
				this.ensureBoardFilename(filenames);
				utils.getFilenames(path.join(__dirname, PerlenPath + 'perlen'),
					perlen => {
						this.ensurePerlenDict(perlen);
						this.weiter();
					});
			});
	}
	ensureBoardFilename(filenames) {
		let s = this.settings;
		s.boardFilenames = filenames;
		if (s.boardFilename != 'none' && !(filenames.includes(s.boardFilename))) {
			//eg., this file has been deleted!
			//console.log('board file deleted!!!! =>replacing board!', s.boardFilename);
			this.lastState.boardFilename = s.boardFilename = filenames[0];
		}
		log('boardFilename ok:', s.boardFilename);
	}
	ensurePerlenDict(perlen) {
		//let s = this.settings;
		let modified = false;
		this.perlenDict = {};
		for (const f of perlen) {
			//console.log('===>f', f)
			let key = base.stringBefore(f, '.');
			//console.log('===>k', key);
			let perle = this.perlenDictFull[key];
			//console.log('===>p', perle);
			if (base.nundef(perle)) {
				modified = true;
				perle = {
					text: base.stringBefore(key, '.'),
					key: base.stringBefore(key, '.'),
					path: key,
				};
			}
			this.perlenDict[key] = perle;
			this.perlenDictFull[key] = perle;
		}
		if (modified) {
			console.log('*save perlenDict*', Object.keys(this.perlenDict).length)
			utils.toYamlFile(this.perlenDictFull, path.join(__dirname, PerlenPath + 'perlenDictFull.yaml'));
			utils.toYamlFile(this.perlenDict, path.join(__dirname, PerlenPath + 'perlenDict.yaml'));
		}

		let pool = this.lastState.pool;
		let barr = this.lastState.state.boardArr;
		let nFields = base.isdef(barr) ? barr.length : 0;
		let poolCorrupted = false;
		for (const idx in pool) {
			if (nundef(this.perlenDict[pool[idx].key])) {
				poolCorrupted = true;
				this.lastState.state = { boardArr: new Array(nFields), pool: {}, poolArr: [] };
				break;

			}
		}
	}
	ensureNoDuplicatesInLastState() {
		let pool = this.lastState.state.pool;
		let poolArr = this.lastState.state.poolArr;
		let st = this.lastState.state;
		if (base.nundef(pool)) return;
		let di = {};
		let newPool = {};
		let i = 0;
		let oldToNewIndex = {};
		for (const key in pool) {

			//achtung hier werden keys veraendert!!!
			//muss diese keys auch in board veraendern!!!
			//falls in boardArr sind!


			let p = pool[key];
			if (base.nundef(di[p.key])) {
				newPool[i] = { key: p.key, index: i };
				oldToNewIndex[key] = i;
				i += 1;
				di[p.key] = true;
			}
		}
		st.pool = newPool;

		st.poolArr = base.arrNoDuplicates(poolArr);

		st.poolArr = this.mapIndices(oldToNewIndex, st.poolArr);
		st.boardArr = this.mapIndices(oldToNewIndex, st.boardArr);

		console.log('pool ok:', Object.keys(newPool).length, ' - old pool', Object.keys(pool).length);
		console.log('poolArr:', st.poolArr.join());
	}
	mapIndices(di, oldArr) {
		let arr = [];
		for (const idx of oldArr) {
			if (base.isList(idx)) {
				let i = idx[0];
				if (i in di) arr.push([di[i], idx[1], idx[2]]);
				else arr.push(idx);
			} else if (idx in di) { arr.push(di[idx]); }
			else { arr.push(idx); }
		}
		return arr;
	}
	weiter() {
		let s = this.settings, lastState = this.lastState;
		if (Verbose) {
			console.log('boards', this.settings.boardFilenames);
			console.log('perlen', Object.keys(this.perlenDict));
			console.log('lastState pool', Object.keys(lastState.state.pool).length);

		}
		log('*** THE END ***');
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
			console.log('state', Object.keys(state.pool).length);
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
	addPerle(filename, addToCurrentPool) {
		if (Verbose) {
			console.log('add new perle', filename)
			console.assert(filename == filename.toLowerCase(), 'FILENAME CASING!!!!');
		}
		let emitPool = false, savePerlen = false;
		let perle;
		let key = base.stringBefore(filename, '.');
		if (!(key in this.perlenDict)) {
			emitPool = true;
			savePerlen = true;
			perle = {
				text: key,
				key: key,
				path: filename,
			};
			this.perlenDict[key] = perle;
		}
		else perle = this.perlenDict[key];

		console.assert(base.isdef(perle), 'KEINE PERLE!!!!!!!!!!!!!! ' + key);

		if (addToCurrentPool) {
			let p = base.firstCondDict(this.state.pool, x => x.key == key);
			if (!p) {
				base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
				this.maxPoolIndex += 1;
				this.safeEmitState(['pool', 'perlenDict']);
			}
		}
		if (savePerlen) {
			utils.toYamlFile(this.perlenDict, path.join(__dirname, PerlenPath + 'perlenDict.yaml'));
		}

	}
	addBoard(filename) {
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
	handleMoveField(client, x) {
		let iField = x.iField;
		let dxy = x.dxy;
		//update board state!
		let boardArr = this.state.boardArr;
		let el = boardArr[iField];
		if (base.isList(el)) el = [el[0], el[1] + dxy.x, el[2] + dxy.y];
		else el = [el, dxy.x, dxy.y];
		boardArr.iField = el;

		this.safeEmitState();
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
		//boardArr[iTo] = iPerle;
		//console.log(base.isdef(x.dxy),x.dxy)
		boardArr[iTo] = x.dxy ? [iPerle, x.dxy.x, x.dxy.y] : iPerle;
		//boardArr[iTo] = x.dxy ? [iPerle, x.x, x.y] : iPerle;

		this.state.boardArr = boardArr;

		if (base.isdef(x.displaced)) {
			// console.log('DDDDDDDDDDDDDDDDDDIS')
			this.state.poolArr.unshift(x.displaced);
		}

		this.safeEmitState();
	}
	handlePlacePerle(client, x) {
		//console.log('PLACE! x', x);
		let iPerle = x.iPerle;
		let iField = x.iField;
		let username = x.username;
		let state = this.state;
		let perle = state.pool[iPerle];

		base.removeInPlace(state.poolArr, iPerle);
		if (base.isdef(x.displaced)) { state.poolArr.unshift(x.displaced); }

		//state.boardArr[iField] = iPerle;
		state.boardArr[iField] = x.dxy ? [iPerle, x.dxy.x, x.dxy.y] : iPerle;

		//console.log('boardArr',state.boardArr)
		this.safeEmitState();

	}
	handleRemovePerlen(client, x) {
		logReceive('removePerlen', x);
		//console.log('rem!')
		let iPerlen = x.iPerlen;
		let iFroms = x.iFroms;
		for (let i = 0; i < iPerlen.length; i++) {
			let iPerle = iPerlen[i];
			let iFrom = iFroms[i];
			this.removePerle(iPerle, iFrom);
		}
		this.safeEmitState();
	}
	removePerle(iPerle, iFrom) {
		this.state.boardArr[iFrom] = null;//update board state!
		this.state.poolArr.unshift(iPerle);
	}
	handleRemovePerle(client, x) {
		logReceive('removePerle', x);
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		this.removePerle(iPerle, iFrom);
		this.safeEmitState();
	}

	handleChooseBoard(client, x) {
		this.settings.boardFilename = x.boardFilename;
		this.safeEmitState(['settings']);
	}
	handleSettings(client, x) {
		logReceive('settings', x.settings.nFields);

		let [s, sNew] = [this.settings, x.settings];
		//let freeFormReset = s.freeForm && !sNew.freeForm;

		base.copyKeys(x.settings, this.settings);
		// console.log('freeForm',s.freeForm)

		if (!s.freeForm) {
			// console.log('freeFormReset!!!')
			let barr = this.state.boardArr;
			let newBarr = barr.map(x => base.isList(x) ? x[0] : x);
			this.state.boardArr = newBarr;
		}

		let barr = this.state.boardArr;
		if (barr.length != s.nFields) {
			if (base.isEmpty(barr) || !base.firstCond(barr, a => a != null)) this.state.boardArr = new Array(s.nFields);
			else if (barr.length < s.nFields) {
				for (let i = barr.length; i < s.nFields; i++) this.state.boardArr.push(null);
			} else {
				// verkuerzung von boardArr!
				let nBarr = barr.length;
				let extras = [];
				for (let i = s.nFields; i < barr.length; i++) {
					if (base.isdef(barr[i])) extras.push(barr[i]);
				}
				for (const idx of extras) {
					if (base.isList(idx)) {
						console.log('YEAHHHH', idx);
						this.state.poolArr.push(idx[0]);
					} else this.state.poolArr.push(idx);
				}
				this.state.boardArr = this.state.boardArr.slice(0, s.nFields);
			}
		}
		//console.log('nFields',s.nFields);
		//console.log('board',this.state.boardArr.length);
		//console.log('pool',this.state.poolArr.length);

		this.safeEmitState(['settings']);
	}
	handlePoolChange(client, x) {
		logReceive('poolChange', client.id);
		//x should have keys ... list of perlen keys
		let keys = x.keys;
		for (const key of keys) {
			let p = base.firstCondDict(this.state.pool, x => x.key == key);
			if (!p) {
				base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
				this.maxPoolIndex += 1;
			}
		}
		console.log('poolChange!!!', Object.keys(this.state.pool).length)
		this.safeEmitState(['pool']);

	}
	handleClearPoolarr(client, x) {
		let newPoolIndices = this.state.boardArr.filter(x => x != null).map(x => base.isList(x) ? x[0] : x);
		console.log('new pool#', newPoolIndices.length);
		console.log('new pool keys:', newPoolIndices);
		//remove all poolArr entries from pool
		for (let p of this.state.poolArr) {
			delete this.state.pool[p];
		}
		console.log('pool', this.state.pool);

		//wieso kann ich nicht die indices preserven?
		if (newPoolIndices.length > 0)
			this.maxPoolIndex = base.arrMax(newPoolIndices) + 1;
		else this.maxPoolIndex = 0;

		this.state.poolArr = [];
		this.safeEmitState(['pool']);
	}
	handleClearPool(client, x) {
		let state = this.state;
		state.poolArr = [];
		state.boardArr = [];
		state.pool = {};
		this.maxPoolIndex = 0;
		safeEmitState(['pool']);
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
// function savePerlenDictToFile() {
// 	utils.toYamlFile(PerlenDict, path.join(__dirname, PerlenPath + 'perlenDict.yaml'));
// }
function log() { if (Verbose) console.log('pg7: ', ...arguments); }
function logReceive(type,) { MessageCounter++; log('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send', ...arguments); }


module.exports = {
	GP2
}
