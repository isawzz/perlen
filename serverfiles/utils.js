module.exports = {
	makeid,
	fromYamlFile,
	toYamlFile,
	convertPerlen,
}
const yaml = require('yaml');
const fs = require('fs');
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
		let fileContents = fs.readFileSync(path);
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
	toYamlFile(di,'./frontEnd/assets/glasperlen.yaml');
	return di;
}

function addRandomTags(name){
	const tags={
		felix:['psychology','time','culture','future','control','causality'],
		ma:['yin','yang','trap','flavors','control','start'],
		wala: ['struktur','gromgorr','meinung','entwicklung','kollectiv','macht']
	};
	let arr=base.isdef(tags[name])?tags[name]:tags.felix;
	let n=base.randomNumber(1,3);
	let t=base.choose(arr,n);
	return t;
}
