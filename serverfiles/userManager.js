module.exports = {
	initUserManager,
	handleConnectionSendClientId,
	handleLoginSendDB,

	handleDisconnected,
	handleMessage,
	handleCreateGame,
	handleJoinGame,
	handleMove,
	handleGameStateUpdate, handleGameStateRequest,
}

//#region prelims
const utils = require('./utils.js');
const base = require('../public/BASE/base.js');
//const perlenGame = require('./perlenGame.js')
var Verbose = false;
var NumConnected = 0;
var MaxId = 1;
var io;
var DB;
var MessageCounter = 0;
const Clients = {};
function initUserManager(serverSocket, db) {
	io = serverSocket;
	DB = db;
	log('users registered:', Object.keys(db.users));
}
function handleConnectionSendClientId(client) {
	let id = client.id;
	Clients[id] = { clientId: id, key: id, index: MaxId, connected: true };
	MaxId += 1;
	logReceive('connection');
	logSend('clientId');
	client.emit('clientId', { text: 'you logged on! id=' + id, clientId: id });
}
function handleLoginSendDB(client, x) {
	let username = x.data;
	let id = client.id;
	Clients[id].username = username;
	let isRegistered = loadUserInfo(username, Clients[id]);
	logReceive('login ' + username + (isRegistered ? ' (registered)' : ''));
	log('logged in:', getConnectedClientNames(), NumConnected);
	logSend('db');
	logBroadcast('userJoined');
	//console.log(DB)
	client.emit('db', { DB: DB, userdata: Clients[id] });
	io.emit('userJoined', { id: id, username: username, msg: 'user ' + username + ' entered lobby!' });
}
function handleDisconnected(client) {
	let id = client.id;
	let name='unknown';
	if (base.isdef(Clients)) {
		let name = Clients[id].username;
		Clients[id].connected = false;
	}
	logReceive('disconnect');
	logBroadcast('userLeft');
	io.emit('userLeft', 'user ' + name + ' left!');
	log('connected:', getConnectedClientNames(), NumConnected);

}
function handleUserMessage(client, x) {
	//someone logged in on server and entered the lobby
	logReceive('userMessage');
	logBroadcast('userMessage');
	let id = client.id;
	let user = Clients[id];
	let name = user.username;
	//console.log('message received from',name, x);
	io.emit('userMessage', x);

}
//#endregion


function handleMessage(client, x) {
	//someone logged in on server and entered the lobby
	logReceive('userMessage');
	logBroadcast('userMessage');
	let id = client.id;
	let user = Clients[id];
	let name = user.username;
	//console.log('message received from',name, x);
	io.emit('userMessage', x);

}
function handleCreateGame(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('userMessage', 'user ' + username + ' entered lobby!');

}
function handleJoinGame(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('userMessage', 'user ' + username + ' entered lobby!');

}
function handleMove(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('userMessage', 'user ' + username + ' entered lobby!');

}


const GameData = { history: [] };
function handleGameStateUpdate(client, x) {
	GameData.history.push(x.data);

}
function handleGameStateRequest(client, x) {
	//someone logged in on server and entered the lobby
	//console.log('position request from',x.msg);
	logSend('gameState');
	let len = GameState.history.length;
	client.emit('gameState', { data: len == 0 ? null : GameState.history[len - 1] });

}






//#region helpers
function getConnectedClientNames() {
	let k = Object.keys(Clients);
	//console.log(k);
	let conn = Object.keys(Clients).filter(x => Clients[x].connected == true);
	//console.log('connected:',conn);
	conn = conn.map(x => Clients[x].username);
	NumConnected = conn.length;
	return conn;
}
function loadUserInfo(username, client) {
	let u = DB.users[username];
	let data = base.nundef(u) ? base.jsCopy(DB.users.guest0) : base.jsCopy(u);
	base.copyKeys(data, client, { id: 'id' });
	client.name = username;
	//console.log('object client hat',Object.keys(client));
	return base.isdef(u);
}
function log() { if (Verbose) console.log('userManager: ', ...arguments); }
function logBroadcast(type) { MessageCounter++; log('#' + MessageCounter, 'broadcast ' + type); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send ' + type); }
function logReceive(type) { MessageCounter++; log('#' + MessageCounter, 'receive ' + type); }

