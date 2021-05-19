module.exports = {
	initPerlenGame,
	handleStartOrJoin,
}
const base = require('../public/BASE/base.js');

var Perlen;
var State = {};
var G={};
function initPerlenGame(perlen) {
	Perlen = perlen;
	let rows = 3, cols = 5;
	let board = new Array(rows * cols);
	let n = Perlen.length;
	console.log('==>there are ', n, 'perlen');
	//console.log('choosing 100 randomly');
	let pool = base.range(0, n - 1); //choose(Perlen,100);
	State = { rows: rows, cols: cols, board: board, pool: pool };
}
function handleStartOrJoin(client, x) {
	console.log('hallo', x, 'wishes to start or join the game!');
	let data = {state:State,instruction:'pick your set of pearls!'};

	//maybe should send the perlen file!
	//right now could send message: click auf all die perlen fuer dein spiel!
	//diese info sollt ich jetzt and jeden der joined senden!

}
