module.exports = {
	initPerlenGame,
	handleStartOrJoin,
	handleMovePerle, handlePlacePerle,handleRelayout,
}
const base = require('../public/BASE/base.js');
const { SKIP_INITIAL_SELECT } = require('../public/BASE/globals.js');

const N=5; // number of perlen im spiel!!!!
const ROWS=2;
const COLS=2;
var Perlen;
var State = {};
var io;
var G = {};
function initPerlenGame(IO, perlen) {
	io = IO;
	Perlen = perlen;
	let rows = ROWS, cols = COLS;
	let board = new Array(rows * cols);
	let pool = Perlen;
	pool = base.choose(Perlen, N);
	let n = pool.length;
	console.log('==>there are ', n, 'perlen');
	for (let i = 0; i < pool.length; i++) { pool[i].index = i };
	State = { rows: rows, cols: cols, poolArr: base.range(0, n - 1), boardArr: board, pool: pool, players: [] };
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
	let perle = base.firstCond(Perlen, x => x.index == iPerle);

	//update board state!
	//das hier ist nur wenn von pool zu board moved!
	let poolArr = State.poolArr;
	base.removeInPlace(poolArr, iPerle);
	let boardArr = State.boardArr;
	boardArr[iField] = iPerle;

	io.emit('gameState', { state: { boardArr: State.boardArr, poolArr: State.poolArr }, username: username, msg: 'user ' + username + ' placed ' + perle.Name + ' to field ' + iField });

}
function handleMovePerle(client, x) {
	let iPerle = x.iPerle;
	let iField = x.iField;
	let username = x.username;
	let perle = base.firstCond(Perlen, x => x.index == iPerle);

	//update board state!
	let boardArr = State.boardArr;
	let iPerleOnBoard = base.firstCond(boardArr, x => x == iPerle);
	boardArr[iPerleOnBoard] = null;
	boardArr[iField] = iPerle;

	io.emit('gameState', { state: { boardArr: State.boardArr, poolArr: State.poolArr }, username: username, msg: 'user ' + username + ' moved ' + perle.Name + ' to field ' + iField });

}
function handleRelayout(client, x) {
	//update board state!
	State.boardArr=x.boardArr;
	State.poolArr = x.poolArr;
	State.rows=x.rows;
	State.cols=x.cols;
	io.emit('gameState', { state: { boardArr: x.boardArr, poolArr: x.poolArr, rows: x.rows, cols: x.cols,  }, username: x.username, msg: 'user ' + x.username + ' modified board'});

}

var MessageCounter = 0;
var Verbose = true;
function log() { if (Verbose) console.log('perlen: ', ...arguments); }
function logBroadcast(type) { MessageCounter++; log('#' + MessageCounter, 'broadcast ' + type); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send ' + type); }
function logReceive(type) { MessageCounter++; log('#' + MessageCounter, 'receive ' + type); }
