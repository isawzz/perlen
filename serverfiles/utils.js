module.exports = {
	makeid,
	fromYamlFile,
	toYamlFile,
	convertPerlen,
	listFiles,
}
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const base = require('../public/BASE/base.js');

function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
function fromYamlFile(path) {
	try {
		let fileContents = fs.readFileSync(path, 'utf8');
		//console.log(typeof fileContents);
		//console.log(fileContents)
		let data = yaml.parse(fileContents);
		//console.log('data',data);
		return data;
	} catch (e) {
		console.log(e);
		return null;
	}
}
function toYamlFile(data, path) {
	let yamlStr = yaml.stringify(data);
	console.log('?')
	fs.writeFileSync(path, yamlStr, 'utf8');
}

function convertPerlen(list) {
	let di = {};
	for (let i = 0; i < list.length; i++) {
		let el = list[i];
		di[i] = {
			file: 'perlen/' + el + '.png',
			title: el,
			key: i,
			tags: { fe: addRandomTags('felix'), di: addRandomTags('wala'), ma: addRandomTags('ma') },
			text: "",
		};
	}
	toYamlFile(di, './frontEnd/assets/glasperlen.yaml');
	return di;
}

function addRandomTags(name) {
	const tags = {
		felix: ['psychology', 'time', 'culture', 'future', 'control', 'causality'],
		ma: ['yin', 'yang', 'trap', 'flavors', 'control', 'start'],
		wala: ['struktur', 'gromgorr', 'meinung', 'entwicklung', 'kollectiv', 'macht']
	};
	let arr = base.isdef(tags[name]) ? tags[name] : tags.felix;
	let n = base.randomNumber(1, 3);
	let t = base.choose(arr, n);
	return t;
}

function listFiles(perlen) {
	const directoryPath = path.join(__dirname, '../public/assets/games/perlen/perlen');
	let names = [];
	fs.readdir(directoryPath, (err, files) => {
		if (err) { return console.log('Unable to scan directory: ' + err); }
		files.forEach(file => {
			// Do whatever you want to do with the file
			names.push(file);//console.log(file);
		});
		console.log(names.length);
		for(let i=0;i<names.length;i++){
			console.log(names[i]);
			let fname = base.stringBefore(names[i],'.');
			console.log(fname);
			let p=findPerle(fname,perlen);
			if (p){
				p.path = fname;
			}else{
				p={path:fname,Name:base.capitalize(fname),Update:base.formatDate(),Created:base.formatDate(),'Fe Tags':'','Wala Tags':'','Ma Tags':''};
				perlen.push(p);
			}
		}
		//save perlen in new file!
		toYamlFile(perlen,'./newPerlen.yaml');
	});
}
function findPerle(fname,perlen){
	let x=base.firstCond(perlen,x=>x.Name.toLowerCase().includes(fname.toLowerCase()));
	if (base.isdef(x)) console.log('found perle for',fname);
	return x;
}