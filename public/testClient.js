onload = start();

async function start() {
	loadAssets('./assets/'); //await loadAssets('./assets/'); //use this when starting in game!
	DB = await route_path_yaml_dict('./assets/data.yaml');

	//autoLogin('ma');//chooseRandom(['ma', 'wala', 'felix', 'nil', 'gul']));
	initLogin(); //use this for production!
	//initGameScreen();
}


















