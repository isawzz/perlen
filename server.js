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
const perlenGame = require('./serverfiles/pg6.js');
const test = require('./serverfiles/serverTest.js');

const DB = utils.fromYamlFile(path.join(__dirname, 'public/data.yaml'));
const PerlenDict = utils.fromYamlFile(path.join(__dirname, 'public/perlenDict.yaml'));
const lastState = utils.fromYamlFile(path.join(__dirname, 'public/lastState.yaml'));
const io = require('socket.io')(http, {
	cors: {
		origins: ['http://localhost:' + PORT]
	}
});

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

//#region file uploading POST routes

const ASSET_PATH = './public/assets/games/perlen/';
const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => { 
		let path=ASSET_PATH + file.fieldname + '/';
		console.log('dir',path)
		cb(null, path); 
	},
	filename: (req, file, cb) => { const fileName = file.originalname.toLowerCase().split(' ').join('-'); cb(null, fileName) }
});
const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		log('FILTER', { url: req.url, req: Object.keys(req), fieldname: file.fieldname });
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
			console.log('correct!', file.mimetype)
			req.body.tag = 'war'
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
		}
	}
});

app.post('/perlen', upload.single('perlen'), function (req, res) {
	log('POST', { url: req.url, fieldname: req.file.fieldname });
	res.append('Location', 'success.html');
	res.status(303).send();
});

app.post('/bretter', upload.single('bretter'), function (req, res) {
	log('POST', { url: req.url, fieldname: req.file.fieldname });
	res.append('Location', 'success.html');
	res.status(303).send();
});

//#endregion

//#region *** CODE STARTS HERE ********************************

userman.initUserManager(io, DB);
const simple = new perlenGame.GP2(io, PerlenDict, DB, lastState);
const tester = test.initTest(io, DB);

io.on('connection', client => {

	//connection and login: userManager
	userman.handleConnectionSendClientId(client); //just sends back client id to client: userManager
	client.on('login', x => userman.handleLoginSendDB(client, x)); //returns DB to client, broadcast entered lobby: userManager
	client.on('disconnect', x => { simple.handlePlayerLeft(client, x); userman.handleDisconnected(client, x); }); //broadcast user left: userManager
	client.on('userMessage', x => userman.handleUserMessage(client, x)); //broadcast user left: userManager

	//the following messages are handled by 'simple' (module or class)

	client.on('perlenImages', x => simple.handlePerlenImages(client, x));
	client.on('generalImages', x => simple.handleGeneralImages(client, x));

	client.on('settings', x => simple.handleSettings(client, x));
	client.on('settingsWithBoardImage', x => simple.handleSettingsWithBoardImage(client, x));


	client.on('movePerle', x => simple.handleMovePerle(client, x));
	client.on('placePerle', x => simple.handlePlacePerle(client, x));
	client.on('relayout', x => simple.handleRelayout(client, x));
	client.on('removePerle', x => simple.handleRemovePerle(client, x));
	client.on('reset', x => simple.handleReset(client, x));
	client.on('startOrJoinPerlen', x => simple.handleStartOrJoin(client, x));

	//deprecate:
	// client.on('image', x => simple.handleImage(client, x));
	// client.on('addToPool', x => simple.handleAddToPool(client, x));
	// client.on('initialPoolDone', x => simple.handleInitialPoolDone(client, x));
	// client.on('board', x => simple.handleBoard(client, x));
	// client.on('boardImage', x => simple.handleBoardImage(client, x));

	client.on('mouse', x => { io.emit('mouse', x); });//should send x,y,username
	client.on('show', x => { io.emit('show', x); });//should send x,y,username
	client.on('hide', x => { io.emit('hide', x); });//should send x,y,username

	client.on('testImageUpload', x => tester.handleImageUpload(client, x));
	client.on('image1', image => {
		// image is an array of bytes
		const buffer = Buffer.from(image);
		fs.writeFile('writeMe.txt', buffer, function (err, result) {
			if (err) console.log('error', err);
		});
		//await fs.writeFile('/tmp/image', buffer).catch(console.error); // fs.promises
	});
	client.on('image2', async image => {
		const buffer = Buffer.from(image, 'base64');
		fs.writeFile('./image.png', buffer, function (err, result) {
			if (err) console.log('error', err);
		});
		console.log('SUCCESS!!!')
		//fs.writeFile('/tmp/image', buffer).catch(console.error); // fs.promises
	});
});
function log(title, o) {
	console.log('_________' + title);
	for (const k in o) {
		console.log(k, o[k]);
	}
}

//#endregion

http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });





