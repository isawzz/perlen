async function loadAssets(path) {
	Daat = {}; DA = {}; Items = {}; ItemsByKey = {};

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();

	C52 = await localOrRoute('C52', path + 'c52.yaml');
	symbolDict = Syms = await localOrRoute('syms', path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await localOrRoute('gsg', path + 'symGSG.yaml');
	WordP = await route_path_yaml_dict(path + 'math/allWP.yaml');

	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	TOMan = new TimeoutManager();
	//console.log('...assets loaded');
}










