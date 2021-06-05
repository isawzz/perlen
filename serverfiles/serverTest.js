//#region requires, const, var
module.exports = { initTest }
const base = require('../public/BASE/base.js');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var MessageCounter = 0;
var Verbose = true;

var io,DB;

function initTest(io,DB){
	io=io,DB=DB;return new Test();
}
function log() { if (Verbose) console.log('TEST: ', ...arguments); }
function logReceive(type,) { MessageCounter++; log('#' + MessageCounter, 'receive', ...arguments); }
function logSend(type) { MessageCounter++; log('#' + MessageCounter, 'send', ...arguments); }

//#endregion

class Test{
	async handleImageUpload(client,x){
		logReceive('testImageUpload',x.filename);
		let image = x.image;
		const buffer = Buffer.from(image, 'base64');
    await fs.writeFile('./tmp/image', buffer).catch(console.error); // fs.promises
	}
}



