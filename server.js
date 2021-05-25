//#region prelim
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const path = require('path');
const base = require('./public/BASE/base.js');
const { PORT } = require('./public/BASE/globals.js');

const utils = require('./serverfiles/utils.js');
const userman = require('./serverfiles/userManager.js');
const simple = require('./serverfiles/perlen.js');

const DB = utils.fromYamlFile(path.join(__dirname, 'public/data.yaml'));
//console.log(DB)
const PerlenDict = utils.fromYamlFile(path.join(__dirname, 'public/assets/games/perlen/perlenDict.yaml'));
//console.log('___________',PerlenDict.playful)
const Perlen = base.dict2list(PerlenDict, 'key');
//console.log('total', Perlen.length);

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
}); //chrome does this by default!
// app.post('/imageUpload', (req,res)=>{
// 	console.log('req',req);
// 	console.log('imageUpload')
// });
//#endregion

//#region formidable POST upload
//var lastFilename;
const fs = require('fs');
var formidable = require('formidable');
app.post('/imageUpload', function (req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, data) {
		console.log('files', data,'fields',fields);
		var oldpath = data.image.path;
		let name = data.image.name;
		console.log('oldpath',name);
		//let lastFilename = 'zhallo';
		var newpath = './public/assets/games/perlen/perlen/' + name;
		//var newpath = './z' + name;
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			res.write('File uploaded and moved!');
			res.end();
			name = base.stringBefore(name, '.');
			simple.addPerle(name);
		});
	});
});
//#endregion

//#region initialization code, socket io
const io = require('socket.io')(http, {
	cors: {
		origins: ['http://localhost:' + PORT]
	}
});

userman.initUserManager(io, DB);
simple.initPerlenGame(io, Perlen, PerlenDict);
//#endregion

//#region io
io.on('connection', client => {

	//connection and login: userManager
	userman.handleConnectionSendClientId(client); //just sends back client id to client: userManager
	client.on('login', x => userman.handleLoginSendDB(client, x)); //returns DB to client, broadcast entered lobby: userManager
	client.on('disconnect', x => userman.handleDisconnected(client, x)); //broadcast user left: userManager
	client.on('userMessage', x => userman.handleUserMessage(client, x)); //broadcast user left: userManager

	client.on('startOrJoinPerlen', x => simple.handleStartOrJoin(client, x));
	client.on('movePerle', x => simple.handleMovePerle(client, x));
	client.on('placePerle', x => simple.handlePlacePerle(client, x));
	client.on('relayout', x => simple.handleRelayout(client, x));
	client.on('reset', x => simple.handleReset(client, x))

	client.on('image', x => simple.handleImage(client, x));

});

//#endregion

http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });



//#region old: create perlenDict from perlen (list)
//load from perlen.yaml
// const Perlen = utils.fromYamlFile(path.join(__dirname, 'public/assets/games/perlen/perlen.yaml'));
// const PerlenDict = savePerlenDict(Perlen);
function savePerlenDict(Perlen) {
	let perlenDict = {};
	for (let i = 0; i < Perlen.length; i++) {
		let p = Perlen[i];
		let k = p.path;
		if (base.nundef(k)) { console.log('path missing!', i, p.Name); continue; }
		if (base.isdef(perlenDict[k])) { console.log('DUPLICATE PATH', k); continue; }
		delete p.index;
		perlenDict[k] = p;
	}
	console.log('perlenDict:', Object.keys(perlenDict).length);
	//utils.listFiles(Perlen)
	utils.toYamlFile(perlenDict, path.join(__dirname, 'public/assets/games/perlen/perlenDict.yaml'));
}
//#endregion



