module.exports = {
	initUserManager,
	handleConnected,
	handleDisconnected,
	handleLogin,
	handleMessage,
	handleCreateGame,
	handleJoinGame,
	handleMove,
}

const utils = require('./utils.js');
const base = require('../public/BASE/base.js');
//const perlenGame = require('./perlenGame.js')
var Verbose = true;
var NumConnected = 0;
var MaxId = 1;
var io;
var DB;
var MessageCounter=0;
const Clients={};
function initUserManager(serverSocket, db) {
	io = serverSocket;
	DB = db;
	//log('users registered:', Object.keys(db.users));
}
function logBroadcast(type){	MessageCounter++;	log('#'+MessageCounter,'broadcast '+type);}
function logSend(type){	MessageCounter++;	log('#'+MessageCounter,'send '+type);}
function logReceive(type){	MessageCounter++;	log('#'+MessageCounter,'receive '+type);}
function handleConnected(client) {
	let id = client.id;
	let username = 'user' + MaxId;
	Clients[id] = { key: id, index: MaxId, username: username, connected:true };
	MaxId += 1;
	logReceive('connect');
	logSend('init');
	client.emit('init', { text: 'you logged on! id=' + id, id: id });
	// NumConnected += 1;
	// console.assert(NumConnected == Object.keys(Clients).map(x=>Clients[x].connected==true).length);
	// log('#users', NumConnected);//, ConnClients)
}
function handleDisconnected(client) {
	//save user data in DB???
	let id = client.id;
	//log('client disconn', client.id)
	let name = Clients[id].username;
	Clients[id].connected = false;
	logReceive('disconnect');
	logBroadcast('msg');
	io.emit('msg', 'user ' + name + ' left!');
	//log('connected:', getConnectedClientNames(), NumConnected);

}
function getConnectedClientNames(){
	let k=Object.keys(Clients);
	//console.log(k);
	let conn =Object.keys(Clients).filter(x=>Clients[x].connected == true);
	//console.log('connected:',conn);
	conn = conn.map(x=>Clients[x].username);
	NumConnected = conn.length;
	return conn;
}
function handleLogin(client, x) {
	//someone logged in on server and entered the lobby
	//console.log('msg:', x);
	let username = x.data;
	let id = client.id;
	Clients[id].username = username;
	let isRegistered = loadUserInfo(username, Clients[id]);
	logReceive('login '+username+(isRegistered?' (registered)':''));
	log('logged in:', getConnectedClientNames(), NumConnected);
	logSend('db');
	logBroadcast('msg');
	client.emit('db',{DB:DB,userdata:Clients[id]});
	io.emit('userJoined',{id:id,unsername:username,msg:'user '+username+' entered lobby!'});

}
function handleMessage(client, x) {
	//someone logged in on server and entered the lobby
	logReceive('msg');
	logBroadcast('msg');
	let id = client.id;
	let user = Clients[id];
	let name = user.username;
	console.log('message received from',name, x);
	io.emit('msg', x);

}
function handleCreateGame(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('msg', 'user ' + username + ' entered lobby!');

}
function handleJoinGame(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('msg', 'user ' + username + ' entered lobby!');

}
function handleMove(client, x) {
	//someone logged in on server and entered the lobby
	io.emit('msg', 'user ' + username + ' entered lobby!');

}
function loadUserInfo(username, client) {
	let u = DB.users[username];
	let data = base.nundef(u) ? base.jsCopy(DB.users.guest0) : base.jsCopy(u);
	base.copyKeys(data, client, {id:'id'});
	client.name = username;
	return base.isdef(u);
	// console.log(client);
}
function log() { if (Verbose) console.log('userManager: ', ...arguments); }







