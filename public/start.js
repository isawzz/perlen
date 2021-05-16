var STARTED=false;
function _start() {
	if (STARTED){console.log('REENTRACE PROBLEM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');return;}
	STARTED=true;
	let items = Perlen;
	items.map(x => x.path = mPath(x));

	console.log(items);

	//ich brauch echt ein mImg
	console.log(dTable);
	//mCenterFlex(dTable)

	//mStyleX(mBy('table'), { bg: 'yellow' });
	//mStyleX(dLineTableMiddle, { bg: 'orange' });
	console.assert(dLineTableMiddle == dTable);
	// let dp=mDiv100(dTable,{bg:'violet'});
	let dp = mDiv(dTable, { display: 'inline-block' });
	let d1 = mDiv(dp, { display: 'inline-block' });
	for (let i = 0; i < 20; i++) {
		let dItem = mDiv(d1, { display: 'inline-block', h: 100, w: 100, bg: 'white', margin: 2 });
	}
	let cols = 5;
	mStyleX(d1, { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, 1fr)` })

	mLinebreak(dTable);
	for (let i = 0; i < Perlen.length; i++) {
		let x = mImg(items[i].path, dTable, { w: 100, h: 100 });
	}

	//let dGrid = mDiv(dTable,{bg:GREEN,w:500,h:500})
	//let grid = iGrid(5,5,dGrid,{w:50,h:50,bg:'red',gap:4}); //geht garnicht!
	//	let board = new Board2D(5,5,dTable,{w:100,h:100,bg:'white',margin:3}	);
}
function mPath(p) {
	let pre='./assets/games/perlen/perlen/';
	let post='.png';
	if (isdef(p.path)) return pre+p.path+post;
	let x = p.Name.toLowerCase();
	x = replaceAll(x, "'", "");
	//x = replaceAll(x, " ", "_");
	return pre+x+post;
}
function perlenTest00(){
	console.log(Perlen, isList(Perlen))
	let p = firstCond(Perlen, x => isdef(x.path) && endsWith(x.path, 'elle'));// Perlen[1].Name;
	console.log(p);
	let name = p.name;
	console.log('name', name);
	let path = './assets/games/perlen/perlen/alles steigt aus der quelle.png';
	let x = mImg(path, dTable, { w: 100, h: 100 });
}
