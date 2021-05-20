//#region prelim
const express = require('express');
const app = express();
const cors = require('cors');
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
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.static(path.join(__dirname, 'public'))); //Serve public directory
app.use(cors());
app.get('/', (req, res) => { 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.sendFile(path.join(__dirname, +'public/index.html')); 
}); //chrome does this by default!

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
			Created: base.formatDate(),
			"Fe Tags": '',
			"Wala Tags": '',
			"Ma Tags": ''
		});
		utils.toYamlFile(Perlen, path.join(__dirname, 'public/assets/games/perlen/perlen.yaml'));
	});
});

//#endregion

const userman = require('./serverfiles/userManager.js');
const simple = require('./serverfiles/perlen.js');
//const io = require('socket.io')(http);

const io = require('socket.io')(http, {
	cors: {
			origins: ['http://localhost:'+PORT]
	}
});

userman.initUserManager(io, DB);
simple.initPerlenGame(io,Perlen)
io.on('connection', client => {

	//connection and login: userManager
	userman.handleConnectionSendClientId(client); //just sends back client id to client: userManager
	client.on('login', x => userman.handleLoginSendDB(client, x)); //returns DB to client, broadcast entered lobby: userManager
	client.on('disconnect', x => userman.handleDisconnected(client, x)); //broadcast user left: userManager
	client.on('userMessage', x => userman.handleUserMessage(client, x)); //broadcast user left: userManager

	client.on('startOrJoinPerlen', x=>simple.handleStartOrJoin(client,x));
	client.on('movePerle', x=>simple.handleMovePerle(client,x));
	client.on('placePerle', x=>simple.handlePlacePerle(client,x));
	client.on('relayout', x=>simple.handleRelayout(client,x));
	client.on('reset',x=>simple.handleReset(client,x))
	// //messaging in lobby: userManager
	// client.on('msg', x => handleMessage(client, x));

	// //game creation/joining: userManager
	// client.on('createGame', x => handleCreateGame(client, x));
	// client.on('joinGame', x => handleJoinGame(client, x));

	// //game play: das jeweilige game!
	// client.on('gameState', x => handleGameStateUpdate(client, x));
	// client.on('gameState', x => handleGameStateRequest(client, x));
	// client.on('move', x => handleMove(client, x));

	//file IO (eg., save new perle)
	client.on('filename', x => { lastFilename = x.msg; });

});


http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });







