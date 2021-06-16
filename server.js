//#region require
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const path = require('path');
const fs = require('fs');
const base = require('./public/BASE/base.js');
const { PORT, PERLEN_DATA_PATH } = require('./public/BASE/globals.js');
const utils = require('./serverfiles/utils.js');
const userman = require('./serverfiles/userManager.js');
const perlenGame = require('./serverfiles/pg8.js');
//const test = require('./serverfiles/serverTest.js');
//#endregion

//#region const (creating DB, PerlenDict, lastState, io)
const DB = utils.fromYamlFile(path.join(__dirname, PERLEN_DATA_PATH + 'data.yaml'));
var PerlenDict = utils.fromYamlFile(path.join(__dirname, PERLEN_DATA_PATH + 'perlenDict.yaml'));
const lastState = utils.fromYamlFile(path.join(__dirname, PERLEN_DATA_PATH + 'lastState.yaml'));
const io = require('socket.io')(http, {
	cors: {
		origins: '*',//['http://localhost:' + PORT]
	}
});
//#endregion

//#region get routes
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

//#region *** CODE STARTS HERE ********************************

userman.initUserManager(io, DB);
const simple = new perlenGame.GP2(io, PerlenDict, DB, lastState);

//const tester = test.initTest(io, DB);

//#endregion

//#region file uploading POST routes
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, PERLEN_DATA_PATH + file.fieldname + '/');
	},

	filename: function (req, file, cb) {
		cb(null, file.originalname);

	}
});
var upload = multer({ storage: storage });

// app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

app.post('/perlen', upload.array('perlen'), (req, res) => {
	res.redirect('/');
	console.log('#files', req.files.length);
	//console.log(Object.keys(req.files[0]));
	req.files.map(x => simple.addPerle(x.filename, false)); //console.log(x.filename));
	console.log('perlen#', Object.keys(simple.perlenDict).length);
});
app.post('/bretter', upload.array('bretter'), (req, res) => {
	res.redirect('/');
	req.files.map(x => simple.addBoard(x.filename)); //console.log(x.filename));
});
//#endregion



//#endregion







io.on('connection', client => {

	//connection and login: userManager
	userman.handleConnectionSendClientId(client); //just sends back client id to client: userManager
	client.on('login', x => { userman.handleLoginSendDB(client, x); }); //returns DB to client, broadcast entered lobby: userManager
	client.on('disconnect', x => { simple.handlePlayerLeft(client, x); userman.handleDisconnected(client, x); }); //broadcast user left: userManager
	client.on('userMessage', x => userman.handleUserMessage(client, x)); //broadcast user left: userManager

	client.on('mouse', x => { io.emit('mouse', x); });//should send x,y,username
	client.on('show', x => { io.emit('show', x); });//should send x,y,username
	client.on('hide', x => { io.emit('hide', x); });//should send x,y,username

	// //the following messages are handled by 'simple' (module or class)
	client.on('movePerle', x => simple.handleMovePerle(client, x));
	client.on('moveField', x => simple.handleMoveField(client, x));
	client.on('placePerle', x => simple.handlePlacePerle(client, x));
	client.on('removePerle', x => simple.handleRemovePerle(client, x));
	client.on('removePerlen', x => simple.handleRemovePerlen(client, x));
	client.on('startOrJoinPerlen', x => simple.handleStartOrJoin(client, x));

	// client.on('chooseBoard', x => simple.handleChooseBoard(client, x));
	client.on('settings', x => simple.handleSettings(client, x));
	client.on('state',  x => simple.handleState(client, x));
	client.on('prefab', x => simple.handlePrefab(client, x));
	client.on('reset', x => simple.handleReset(client, x));

	//perlenOptions should replace all the ones below!
	client.on('perlenOptions', x => simple.handlePerlenOptions(client, x)); 
	client.on('poolChange', x => simple.handlePoolChange(client, x));
	client.on('removeRandom', x => simple.handleRemoveRandom(client, x));
	client.on('clearPoolarr', x => simple.handleClearPoolarr(client, x));
	client.on('clearPool', x => simple.handleClearPoolarr(client, x));

	// client.on('initLastState', x => {
	// 	//console.log('***got last state: board:', x.lastState.settings.boardFilename);
	// 	simple.initLastState(x.lastState);
	// });

});

http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });

//#region helpers
function log(title, o) { console.log('_________' + title); for (const k in o) { console.log(k, o[k]); } }

//#endregion

//#region ein NEUES PERLENDICT MACHEN!!!

function newPerlenDict() {
	return;
	let p2 = {};
	let perlenDictOrig = utils.fromYamlFile(path.join(__dirname, './public/assets/vault/perlenDictOrig.yaml'));
	let keys = Object.keys(PerlenDict);
	keys.sort();

	for (const k of keys) {
		let p = perlenDictOrig[k];
		console.log(p.Name)
		p2[k] = {
			key: k,
			path: k + '.png',
			text: p.Name,

		}
		//return;
	}

	utils.toYamlFile(p2, PERLEN_DATA_PATH + 'perlenDict.yaml');
	return p2;
}
//PerlenDict = newPerlenDict();

//#endregion


