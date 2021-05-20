module.exports = {
	initPerlenGame,
	handleStartOrJoin, handleReset,
	handleMovePerle, handlePlacePerle, handleRelayout,
}
const base = require('../public/BASE/base.js');
const { SKIP_INITIAL_SELECT } = require('../public/BASE/globals.js');

var N = 50; // number of perlen im spiel!!!!
const ROWS = 4;
const COLS = 4;
var Perlen;
var State = {};
var io;
var G = {};
function initState(x = {}) {
	let pool = base.jsCopy(Perlen);
	let [rows, cols] = [base.valf(x.rows, ROWS), base.valf(x.cols, COLS)];
	let board = new Array(rows * cols);
	pool = base.choose(Perlen, base.valf(x.N, N));
	let n = pool.length;
	console.log('==>there are ', n, 'perlen');
	for (let i = 0; i < pool.length; i++) { pool[i].index = i };
	State = {
		rows: rows, cols: cols,
		poolArr: base.range(0, n - 1),
		boardArr: board,
		pool: pool,
		players: [], //unused
	};
}
function initPerlenGame(IO, perlen) {
	io = IO;
	Perlen = perlen;
	initState();
}
function handleReset(client, x) {
	console.log('handleReset', x)
	initState(x);
	io.emit('gameState', { state: State, username: x.username });
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
function handlePlacePerle(client, x) {
	let iPerle = x.iPerle;
	let iField = x.iField;
	let username = x.username;
	let perle = base.firstCond(State.pool, x => x.index == iPerle);

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
	io.emit('gameState',
		{
			state: {
				rows: State.rows,
				cols: State.cols,
				boardArr: State.boardArr,
				poolArr: State.poolArr
			}, username: username, msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iField
		});

}
function handleMovePerle(client, x) {
	let iPerle = x.iPerle;
	let iFrom = x.iFrom;
	let iTo = x.iTo;
	let username = x.username;
	let perle = base.firstCond(State.pool, x => x.index == iPerle);

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

var MessageCounter = 0;
var Verbose = true;
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logBroadcast(type) { MessageCounter++; log('#' + MessageCounter, 'broadcast ' + type); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send ' + type); }
function logReceive(type) { MessageCounter++; log('#' + MessageCounter, 'receive ' + type); }
