var Verbose = false;
const SAVE_LAST_STATE = false; //dep
const LOAD_LAST_STATE = true; //dep 

//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var MessageCounter = 0;
const PerlenPath = '../public/PERLENDATA/';

//#endregion
class GP2 {
	constructor(io, perlenDict, DB, lastState) {
		if (Verbose) {
			console.log('lastState defined', base.isdef(lastState));
			if (base.isdef(lastState)) console.log(Object.keys(lastState.state.pool).length);
		}
		this.io = io;
		this.perlenDictFull = perlenDict;
		this.db = DB;
		this.randomIndices = [];
		this.initializing = true;

		//lastState = null; //TEST!

		this.settings = base.jsCopy(DB.games.gPerlen2);
		if (!LOAD_LAST_STATE || base.nundef(lastState)) lastState = this.emptyState();
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
	//#region lastState safety checks
	emptyState() {
		console.log('load emptyState')
		return { settings: {}, state: {}, randomIndices: [] };
	}
	ensureBoardFilename(filenames) {
		let s = this.settings;
		s.boardFilenames = filenames;
		if (s.boardFilename != 'none' && !(filenames.includes(s.boardFilename))) {
			//eg., this file has been deleted!
			//console.log('board file deleted!!!! =>replacing board!', s.boardFilename);
			this.lastState.boardFilename = s.boardFilename = filenames[0];
		}
		logg('boardFilename ok:', s.boardFilename);
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
		let randomIndices = this.lastState.randomIndices;
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
		this.randomIndices = this.mapIndices(oldToNewIndex, randomIndices);

		//console.log('pool ok:', Object.keys(newPool).length, ' - old pool', Object.keys(pool).length);
		if (Verbose) console.log('poolArr:', st.poolArr.join());
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
	//#endregion

	//#region init 
	weiter() {
		let s = this.settings, lastState = this.lastState;
		if (Verbose) {
			//console.log('boards', this.settings.boardFilenames);
			//console.log('perlen', Object.keys(this.perlenDict));
			//console.log('lastState pool', Object.keys(lastState.state.pool).length);

		}
		logg('*** THE END ***');
		this.state = {};

		this.initState(lastState.state, lastState.settings, lastState.randomIndices);

		this.players = {};

		this.clients = {};
	}
	initState(state, settings, randomIndices) {
		//console.log(state.pool)
		base.copyKeys(state, this.state);
		base.copyKeys(settings, this.settings);
		// console.log('settings', this.settings);
		if (base.isdef(state.pool)) {
			logg('state', Object.keys(state.pool).length);
			this.maxPoolIndex = Object.keys(state.pool).length;
			this.randomIndices = randomIndices;
		} else {
			this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);
			this.state.boardArr = [];
			this.randomIndices = Object.keys(this.state.pool).map(x => Number(x));
		}
	}
	//#endregion

	//#region players
	addPlayer(client, x) {
		let username = x;
		let id = client.id;
		logg('add player', username, id)
		this.clients[id] = client;
		let pl = { id: id, username: username };
		this.players[id] = pl;
		return pl;
	}
	getPlayerNames() { return Object.values(this.players).map(x => x.username); }
	//#endregion

	//#region upload of perle or board
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
	//#endregion

	//#region join or leave handlers
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
	//#endregion

	//#region move handlers
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
	removePerle(iPerle, iFrom) {
		this.state.boardArr[iFrom] = null;//update board state!
		this.state.poolArr.unshift(base.isList(iPerle) ? iPerle[0] : iPerle);
	}
	handleRemovePerle(client, x) {
		logReceive('removePerle', x);
		let iPerle = x.iPerle;
		let iFrom = x.iFrom;
		this.removePerle(iPerle, iFrom);
		this.safeEmitState();
	}
	//#endregion

	//#region setting handlers
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

		this.reduceBoardArrIfDoesntFit();
		this.safeEmitState(['settings']);
	}
	handlePrefab(client, x) {
		let name = x.name;
		let settings = x.settings;
		this.db.standardSettings[name] = settings;
		utils.toYamlFile(this.db, path.join(__dirname, PerlenPath + 'data.yaml'));//PerlenPath+'data.yaml');
		this.io.emit('dbUpdate', { standardSettings: this.db.standardSettings });
	}
	handleState(client, x) {
		this.randomIndices = x.randomIndices;
		let state = this.state = x.state;
		this.reduceBoardArrIfDoesntFit();
		console.log('state.pool', state.pool)
		// let indices = Object.values(state.pool).map(x=>x.index);
		// this.maxPoolIndex = base.arrMax(indices)+1;
		// console.log('maxPoolIndex',this.maxPoolIndex);
		this.safeEmitState(['pool']);
	}
	handlePerlenOptions(client, x) {
		if (x.clearBoard && x.clearPool) { this.clearAllPerlen(); }
		else if (x.clearBoard) { this.clearBoard(); }
		else if (x.clearPool) { this.clearPool(); }

		if (!x.clearPool && x.nRemove > 0) {
			if (x.justRandom) this.removeRandomFromPool(x.nRemove);
			else this.removeNFromPool(x.nRemove);
		}

		if (x.nAdd > 0) {
			this.addRandomPerlenToPool(x.nAdd);
		}

		this.safeEmitState(['pool']);
	}
	//#maybe deprecate! =>use handlePerlenOptions instead!!!
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
	handlePoolChange(client, x) {
		logReceive('poolChange', client.id);
		//x should have keys ... list of perlen keys
		let keys = x.keys;
		if (base.isdef(keys)) {
			for (const key of keys) {
				let p = base.firstCondDict(this.state.pool, x => x.key == key);
				if (!p) {
					base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
					this.maxPoolIndex += 1;
				}
			}
		} else if (base.isdef(x.n)) { this.addRandomPerlenToPool(x.n); }

		//console.log('poolChange!!!', Object.keys(this.state.pool).length)
		this.safeEmitState(['pool']);

	}
	handleClearPoolarr(client, x) { this.clearPool(); this.safeEmitState(['pool']); }
	handleRemoveRandom(client, x) { if (base.isdef(x.n)) { this.removeRandomFromPool(x.n); this.safeEmitState(['pool']); } }
	handleClearPool(client, x) {		this.clearAllPerlen();		safeEmitState(['pool']);	}
	handleReset(client, x) {
		logReceive('reset', client.id);
		this.lastState.state = this.state = {};
		this.lastState.randomIndices = [];
		this.maxPoolIndex = base.initServerPool(this.settings, this.state, this.perlenDict);
		this.state.boardArr = [];
		this.randomIndices = Object.keys(this.state.pool).map(x => Number(x));
		this.safeEmitState(['pool'])
	}
	//#endregion

	//#region helpers for state changes
	addRandomPerlenToPool(n) {
		let poolKeys = Object.values(this.state.pool).map(x => x.key);
		let allKeys = Object.keys(this.perlenDict);
		let availableKeys = base.arrMinus(allKeys, poolKeys);
		let randomKeys = base.choose(availableKeys, n);

		for (const key of randomKeys) {
			base.addToPool(this.state.pool, this.state.poolArr, this.perlenDict[key], this.maxPoolIndex);
			this.randomIndices.push(this.maxPoolIndex);
			this.maxPoolIndex += 1;
		}
	}
	reduceBoardArrIfDoesntFit() {
		let [s, barr] = [this.settings, this.state.boardArr];
		console.log('handleState/settings', barr.length, 's.nFields', s.nFields)
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
						//console.log('YEAHHHH', idx);
						this.state.poolArr.push(idx[0]);
					} else this.state.poolArr.push(idx);
				}
				this.state.boardArr = this.state.boardArr.slice(0, s.nFields);
			}
		}
		//console.log('nFields',s.nFields);
		//console.log('board',this.state.boardArr.length);
		//console.log('pool',this.state.poolArr.length);

	}
	removeRandomFromPool(n) {
		let inter = base.intersection(this.state.poolArr, this.randomIndices);
		let keys = base.choose(inter, n);
		//console.log('rr','n',n,'\ninter',inter,'\nkeys',keys)
		for (let p of keys) {
			//console.log('removing',this.state.pool[p].key);
			base.removeInPlace(this.randomIndices, p);
			base.removeInPlace(this.state.poolArr, p);
			delete this.state.pool[p];
		}

	}
	removeNFromPool(n) {
		let inter = this.state.poolArr;
		let keys = base.choose(inter, n);
		for (let p of keys) {
			base.removeInPlace(this.randomIndices, p);
			base.removeInPlace(this.state.poolArr, p);
			delete this.state.pool[p];
		}
	}
	clearAllPerlen() {
		let state = this.state;
		state.poolArr = [];
		state.boardArr = [];
		state.pool = {};
		this.randomKeys = [];
		this.maxPoolIndex = 0;
	}
	clearBoard() {
		//add a		
		//alle von boardArr muessen zu poolArr als erstes
		for (let i = 0; i < boardArr.lengthh; i++) {
			let iPerle = boardArr[i];
			if (iPerle === null) { continue; }
			removePerle(iPerle, i);
		}
	}
	clearPool() {
		//remove all poolArr entries from pool
		for (let p of this.state.poolArr) {
			base.removeInPlace(this.randomIndices, p);
			delete this.state.pool[p];
		}
		console.log('pool', this.state.pool);
		let indices = Object.keys(this.state.pool);
		if (indices.length > 0) this.maxPoolIndex = base.arrMax(indices) + 1;
		else this.maxPoolIndex = 0;
		this.state.poolArr = [];
	}
	//#endregion

	sendMessage(username, msg) { this.io.emit('userMessage', { username: username, msg: msg }); }
	safeEmitState(keys, eMore, client) {
		if (base.nundef(keys)) keys = [];
		let o = { state: { boardArr: this.state.boardArr, poolArr: this.state.poolArr } };
		if (keys.includes('settings')) o.settings = this.settings;
		if (keys.includes('pool')) { o.state.pool = this.state.pool; o.randomIndices = this.randomIndices; }
		if (keys.includes('perlenDict')) o.perlenDict = this.perlenDict;
		if (base.isdef(eMore)) base.copyKeys(eMore, o);

		this.saveLastState();

		if (base.isdef(client)) client.emit('gameState', o); else this.io.emit('gameState', o);

	}

	// doesnt really work ono heroku! can delete this?
	saveLastState() {
		let isInit = this.initializing;
		if (this.initializing) { console.log('first gameState emit!'); this.initializing = false; }
		if (!SAVE_LAST_STATE && isInit) { console.log('not saving lastState!'); }
		if (!SAVE_LAST_STATE) return;

		let lastSettings = base.jsCopy(this.settings);
		delete lastSettings.boardFilenames;
		let pathState = './public/PERLENDATA/lastState.yaml';

		let data = { randomIndices: this.randomIndices, settings: lastSettings, state: this.state };
		let text = utils.toYamlString(data);
		fs.writeFile(pathState, text, function (err) {
			if (err) throw err;
			logg('Saved!');
		});
	}


}



//#region helpers

function logg() { if (Verbose) console.log('pg7: ', ...arguments); }
function logReceive(type,) { MessageCounter++; logg('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; logg('#' + MessageCounter, 'send', ...arguments); }


module.exports = {
	GP2
}
