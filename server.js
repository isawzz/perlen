const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const base = require('./public/BASE/base.js');
const { PORT } = require('./public/BASE/globals.js');
const utils = require('./serverfiles/utils.js');
var fs = require('fs');
var lastFilename;
var formidable = require('formidable');

const DB = utils.fromYamlFile(path.join(__dirname, 'data.yaml'));
const Perlen = utils.fromYamlFile(path.join(__dirname, 'public/assets/games/perlen/perlen.yaml'));
//console.log('perlen',Perlen);

//utils.listFiles(Perlen);

app.use(express.static(path.join(__dirname, 'public'))); //Serve public directory
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, +'public/index.html')); }); //chrome does this by default!

app.post('/imageUpload', function (req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		//console.log('files', files);
		var oldpath = files.image.path;
		var newpath = './public/assets/games/perlen/perlen/' + lastFilename + '.png';// + files.filetoupload.name;
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			res.write('File uploaded and moved!');
			res.end();
		});
		if (lastFilename == 'dasSterben') return;
		Perlen.push({
			Name: lastFilename,
			path: lastFilename,
			Update: base.formatDate(),
			Created:base.formatDate(),
			"Fe Tags":'',
			"Wala Tags":'',
			"Ma Tags":''
		});
		utils.toYamlFile(Perlen,path.join(__dirname, 'public/assets/games/perlen/perlen.yaml'));
	});
});

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
	client.on('filename', x => { lastFilename = x.msg; });
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


http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });







