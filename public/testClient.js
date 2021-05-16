onload = start();

async function start() {

	//hide everything!

	loadAssets('./assets/'); //await loadAssets('./assets/'); //use this when starting in game!
	DB = await route_path_yaml_dict('./assets/data.yaml');
	U = DB.users.ma; U.name = U.username = Username = U.id;

	let USESOCKETS=false;
	if (USESOCKETS) autoLogin('ma');//chooseRandom(['ma', 'wala', 'felix', 'nil', 'gul']));
	//initLogin(); //use this for production!

	initGame(Username,USESOCKETS);
}


















