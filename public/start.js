function _start() {

	if (nundef(Perlen)) { return setTimeout(_start, 200); }

	let items = Perlen;
	items.map(x => x.path = './assets/games/perlen/perlen/' + x.Name.toLowerCase() + '.png');

	console.log(items);

	//ich brauch echt ein mImg
}