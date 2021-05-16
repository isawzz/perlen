async function dbInit(appName, dir = '../DATA/') {
	let users = await route_path_yaml_dict(dir + 'users.yaml');
	let settings = await route_path_yaml_dict(dir + 'settings.yaml');
	let addons = await route_path_yaml_dict(dir + 'addons.yaml');
	let games = await route_path_yaml_dict(dir + 'games.yaml');
	//let speechGames = await route_path_yaml_dict(dir + '_speechGames.yaml');
	let tables = await route_path_yaml_dict(dir + 'tables.yaml');

	DB = {
		id: appName,
		users: users,
		settings: settings,
		games: games,
		tables: tables,
		//speechGames: speechGames,
		addons: addons,
	};

	dbSave(appName);
}
async function dbLoad(appName, callback) {
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();

		DB = firstCond(sData, x => x.id == appName);
		//console.log('...loaded DB', DB);

		if (isdef(callback)) callback();
	});
}

var BlockServerSend = false;
function dbSave(appName, callback) {
	if (BlockServerSend) { setTimeout(() => dbSave(appName, callback), 1000); }
	else {
		//console.log('saving DB:',appName,DB);
		let url = SERVERURL + appName;
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(DB)
		}).then(() => { BlockServerSend = false; console.log('unblocked...'); if (callback) callback();}); //console.log('unblocked...'); });
	}
}
