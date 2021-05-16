const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const base = require('./public/BASE/base.js');
const { PORT } = require('./public/BASE/globals.js');
const utils = require('./serverfiles/utils.js');



const DB = utils.fromYamlFile(path.join(__dirname, 'data.yaml'));
console.log('DB',DB);


app.use(express.static(path.join(__dirname, 'public'))); //Serve public directory
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, +'public/index.html')); }); //chrome does this by default!

//new code:
const { initUserManager, handleConnected, handleDisconnected, handleLogin, handleMessage, handleCreateGame, handleJoinGame, handleMove } = require('./serverfiles/userManager.js');
const io = require('socket.io')(http);
initUserManager(io, DB);
io.on('connection', client => {
	handleConnected(client);
	client.on('disconnect', x => handleDisconnected(client, x));
	client.on('login', x => handleLogin(client, x));
	client.on('msg', x => handleMessage(client, x));
	client.on('createGame', x => handleCreateGame(client, x));
	client.on('joinGame', x => handleJoinGame(client, x));
	client.on('move', x => handleMove(client, x));
});

//old code:
// const io = require('socket.io')(http);
// io.on('connection', (socket) => { 
// 	console.log('a user connected');
// 	socket.on('disconnect', ()=>{
// 		console.log('user disconnected!');
// 	}); 
// 	socket.on('message', message =>{
// 		console.log('message',message);
// 		let port = process.env.PORT||PORT;
// 		message.content='port '+port+', ';
// 		message.content += DB.games.gAbacus.friendly;
// 		io.emit('message',message); //broadcast message to everryone connected!
// 	});
// });


http.listen(process.env.PORT||PORT, () => { console.log('listening on port '+PORT); });







