//#region prelim
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const path = require('path');
const fs = require('fs');

const base = require('./public/BASE/base.js');
const { PORT } = require('./public/BASE/globals.js');

const utils = require('./serverfiles/utils.js');
const userman = require('./serverfiles/userManager.js');
const simple = require('./serverfiles/perlenClass.js');

const DB = utils.fromYamlFile(path.join(__dirname, 'public/data.yaml'));
const PerlenDict = utils.fromYamlFile(path.join(__dirname, 'public/perlenDict.yaml'));

app.all('/*', function (req, res, next) {
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
});
//#endregion

//#region initialization code, socket io
const io = require('socket.io')(http, {
	cors: {
		origins: ['http://localhost:' + PORT]
	}
});

userman.initUserManager(io, DB);
simple.initPerlenGame(io, PerlenDict);
//#endregion

//#region io
io.on('connection', client => {

	//connection and login: userManager
	userman.handleConnectionSendClientId(client); //just sends back client id to client: userManager
	client.on('login', x => userman.handleLoginSendDB(client, x)); //returns DB to client, broadcast entered lobby: userManager
	client.on('disconnect', x => { simple.handlePlayerLeft(client, x); userman.handleDisconnected(client, x); }); //broadcast user left: userManager
	client.on('userMessage', x => userman.handleUserMessage(client, x)); //broadcast user left: userManager

	//the following messages are handled by 'simple' (module or class)
	client.on('image', x => simple.handleImage(client, x));
	client.on('movePerle', x => simple.handleMovePerle(client, x));
	client.on('placePerle', x => simple.handlePlacePerle(client, x));
	client.on('relayout', x => simple.handleRelayout(client, x));
	client.on('removePerle', x => simple.handleRemovePerle(client, x));
	client.on('reset', x => simple.handleReset(client, x))
	client.on('startOrJoinPerlen', x => simple.handleStartOrJoin(client, x)); 


});

//#endregion

http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });





