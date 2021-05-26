module.exports = {
	addPerle, initPerlenGame,
	handleImage, handleMovePerle, handlePlacePerle,handlePlayerLeft,
	handleRelayout, handleRemovePerle, handleReset,
	handleStartOrJoin,
}
//#region requires, const, var
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

const { SKIP_INITIAL_SELECT } = require('../public/BASE/globals.js');

var N = 50; // number of perlen at random init!!!!
const ROWS = 4;
const COLS = 4;
var MaxIndex = 0; //when adding perle, always give higher index to be unique!
var PerlenDict;
var State = {};
var io;
var byIndex = {};
var Settings;
var MessageCounter = 0;
var Verbose = true;
//#endregion

//#region interface
function addPerle(filename) {
	console.log('adding perle for', filename);
	console.assert(filename == filename.toLowerCase(), 'FILENAME CASING!!!!')

	// if this filename is already present in pool, do NOT add it again!!!
	let emitPool = false, savePerlen = false;
	//not in PerlenDict => not in pool!
	let perle;
	if (perleNichtInPerlenDict(filename)) { emitPool = true; savePerlen = true; perle = addToPerlenDict(filename); }
	else perle = PerlenDict[filename];

	console.assert(base.isdef(perle), 'KEINE PERLE!!!!!!!!!!!!!! ' + filename);

	let poolPerle = findPerleInStatePool(perle);
	if (poolPerle == null) {
		poolPerle = addToByIndex(perle);
		addToPoolArr(poolPerle.index);
		io.emit('gameState', { state: State });
		if (savePerlen) { savePerlenDictToFile(); }
	}
	// if (perleNichtInStatePool(perle)) { emitPool = true; addToByIndex(perle); }
	else { console.assert(base.isdef(State.pool[poolPerle.index]), 'SCHON IN STATE POOL!!! do nothing!'); }

	// if (emitPool) io.emit('gameState', { state: State });
	// else {
	// 	io.emit('gameState', {
	// 		state: { rows: State.rows, cols: State.cols, boardArr: State.boardArr, poolArr: State.poolArr, },
	// 		username: 'unknown',
	// 		msg: 'someone added new perle ' + perle.Name,
	// 	});
	// 	// io.emit('gameState', { state: { poolArr: State.poolArr } });
	// }
}
function initPerlenGame(IO, perlenDict) {
	io = IO;
	PerlenDict = perlenDict;
	initState();
}
function handleImage(client, x) {
	try {
		let isTesting = x.filename == 'aaa';
		let fname;
		if (isTesting) {
			fname = path.join(__dirname, x.filename + '.png');
			console.log('...fake saving file', fname); return;
		}
		let filename = x.filename.toLowerCase();
		fname = path.join(__dirname, '../public/assets/games/perlen/perlen/' + x.filename + '.png')
		let imgData = decodeBase64Image(x.data);
		fs.writeFile(fname, imgData.data,
			function () {
				console.log('...images saved:', fname);
				addPerle(filename);		// add perle!
			});
	}
	catch (error) {
		console.log('ERROR:', error);
	}
}
function handleMovePerle(client, x) {
	let iPerle = x.iPerle;
	let iFrom = x.iFrom;
	let iTo = x.iTo;
	let username = x.username;
	let perle = byIndex[iPerle];

	//update board state!
	let boardArr = State.boardArr;
	boardArr[iFrom] = null;
	boardArr[iTo] = iPerle;

	State.boardArr = boardArr;

	if (base.isdef(x.displaced)) {
		// console.log('DDDDDDDDDDDDDDDDDDIS')
		State.poolArr.unshift(x.displaced);
	}


	io.emit('gameState',
		{
			state: {
				rows: State.rows,
				cols: State.cols,
				boardArr: State.boardArr,
				poolArr: State.poolArr,
			}, username: username, msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iTo
		});

	// io.emit('gameState', { state: { boardArr: State.boardArr, poolArr: State.poolArr }, username: username, msg: 'user ' + username + ' moved ' + perle.Name + ' to field ' + iField });

}
function handlePlacePerle(client, x) {
	let iPerle = x.iPerle;
	let iField = x.iField;
	let username = x.username;
	let perle = State.pool[iPerle];

	//update board state!
	//das hier ist nur wenn von pool zu board moved!
	let poolArr = State.poolArr;
	base.removeInPlace(poolArr, iPerle);
	if (base.isdef(x.displaced)) {
		// console.log('DDDDDDDDDDDDDDDDDDIS')
		poolArr.unshift(x.displaced);
	}
	let boardArr = State.boardArr;
	boardArr[iField] = iPerle;
	State.poolArr = poolArr;
	State.boardArr = boardArr;
	io.emit('gameState', {
		state: { rows: State.rows, cols: State.cols, boardArr: State.boardArr, poolArr: State.poolArr },
		username: username,
		msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iField
	});

}
function handleRelayout(client, x) {
	//update board state!
	State.boardArr = x.boardArr;
	State.poolArr = x.poolArr;
	State.rows = x.rows;
	State.cols = x.cols;
	io.emit('gameState',
		{
			state: {
				boardArr: x.boardArr,
				poolArr: x.poolArr,
				rows: x.rows,
				cols: x.cols,
			}, username: x.username, msg: 'user ' + x.username + ' modified board'
		});

}
function handleRemovePerle(client, x) {
	let iPerle = x.iPerle;
	let iFrom = x.iFrom;
	let username = x.username;
	let perle = byIndex[iPerle];

	//update board state!
	let boardArr = State.boardArr;
	boardArr[iFrom] = null;
	State.boardArr = boardArr;

	let poolArr = State.poolArr;
	poolArr.unshift(iPerle);
	State.poolArr = poolArr;

	io.emit('gameState', {
		state: { rows: State.rows, cols: State.cols, boardArr: State.boardArr, poolArr: State.poolArr, },
		username: username,
		msg: 'user ' + username + ' removed ' + perle.Name,
	});

	// io.emit('gameState', { state: { boardArr: State.boardArr, poolArr: State.poolArr }, username: username, msg: 'user ' + username + ' moved ' + perle.Name + ' to field ' + iField });

}
function handleReset(client, x) {
	console.log('handleReset', x)
	initState(x);
	emitGameStateIncludingPool(x.username);

}
function handleStartOrJoin(client, x) {
	let username = x;
	State.players.push(username);
	console.log('hallo', x, 'wishes to start or join the game!');

	if (SKIP_INITIAL_SELECT) {
		logSend('gameState');
		client.emit('gameState', { state: State });
	} else {
		let data = { state: State, instruction: 'pick your set of pearls!' };
		client.emit('initialPool', { state: { pool: State.pool }, instruction: 'pick your set!' });
	}
	io.emit('userMessage', { username: x, msg: 'user ' + username + ' joined game!' });
}
function handlePlayerLeft(client, x) { }

//#endregion

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
function addToByIndex(perle) {
	function nextIndex(perle) {
		perle.index = MaxIndex;
		MaxIndex += 1;
		byIndex[perle.index] = perle;
	}
	let newPerle = {};
	base.copyKeys(perle, newPerle);
	nextIndex(newPerle);
	//console.assert(base.isdef(State.pool[newPerle.index]));
	return newPerle;
}
function addToPoolArr(index) { State.poolArr.push(index); }
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
function emitGameStateIncludingPool(username) { io.emit('gameState', { state: State, username: username }); }
function findPerleInStatePool(p) {
	for (const idx in State.pool) {
		if (State.pool.path == p.path) return State.pool[idx];
	}
	return null;
}
function getRandomPerlenKeys(n) { return base.choose(Object.keys(PerlenDict), n); }

function initState(settings = {}) {
	byIndex = {}; MaxIndex = 0; State = {};

	let [rows, cols] = [base.valf(settings.rows, ROWS), base.valf(settings.cols, COLS)];
	let board = new Array(rows * cols);
	let keys = getRandomPerlenKeys(base.valf(settings.N, N));
	//keys[0]='playful';
	//keys[1]='carelessness';
	keys.map(x => addToByIndex(PerlenDict[x]));

	State = {
		rows: rows,
		cols: cols,
		poolArr: Object.values(byIndex).map(x => x.index),
		boardArr: board,
		pool: byIndex,
		players: [],
	};

	let n = keys.length;
	console.log('==>there are ', n, 'perlen');
}
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logBroadcast(type) { MessageCounter++; log('#' + MessageCounter, 'broadcast ' + type); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send ' + type); }
function logReceive(type) { MessageCounter++; log('#' + MessageCounter, 'receive ' + type); }
function perleNichtInPerlenDict(filename) { return base.nundef(PerlenDict[filename]); }
function perleNichtInStatePool(p) {
	for (const idx in State.pool) {
		if (State.pool.path == p.path) return false;
	}
	return true;
}
function savePerlenDictToFile() {
	// let newDict = {};
	// for (const k in PerlenDict) {
	// 	let newPerle = jsCopy(PerlenDict[k]);
	// 	delete newPerle.index;
	// 	newDict[k] = newPerle;
	// }

	utils.toYamlFile(PerlenDict, path.join(__dirname, '../public/perlenDict.yaml'));
}




