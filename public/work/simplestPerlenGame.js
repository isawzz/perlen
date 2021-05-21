function simplestPerlenGame() {
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + Username);

	let color = USERNAME_SELECTION == 'local' ? localStorage.getItem('BaseColor') : null;
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

	if (PERLEN_EDITOR_OPEN_AT_START) createPerlenEditor();


	if (!USESOCKETS) waitUntilPerlen();
	else { sendStartOrJoinPerlenGame(); }

}
function waitUntilPerlen() {
	if (nundef(Perlen)) { return TOMain = setTimeout(waitUntilPerlen, 200); }
	else {
		clearTimeout(TOMain)
		_start();
	}

}
function sendStartOrJoinPerlenGame() {
	if (STARTED) { console.log('REENTRACE PROBLEM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); return; }
	STARTED = true;
	let data = Username;
	logClientSend('startOrJoinPerlen', data);
	Socket.emit('startOrJoinPerlen', data);
	window.onkeydown = keyDownHandler;
	window.onkeyup = keyUpHandler;
	mBy('sidebar').ondblclick = createPerlenEditor;
	G = new SimpleClass();
}
//skip next 2 steps!
function handleInitialPool(data) {
	logClientReceive('initialPool', data);
	G.initialPool(data.state.pool);
}
function sendInitialPool() { }

function handleGameState(data) {
	logClientReceive('gameState', data);
	//console.log('data',data)
	G.presentGameState(data);
}
function sendMovePerle(perle, fFrom, fTo, dis) {
	//console.log('===> PLACE')
	let data = { iPerle: perle.index, iFrom: fFrom.index, iTo: fTo.index, displaced:isdef(dis)?dis.index:null, username: Username };
	logClientSend('movePerle', data);
	Socket.emit('movePerle', data);
}
function sendPlacePerle(perle, field,dis) {
	//console.log('hallo sending move')
	let data = { iPerle: perle.index, iField: field.index, displaced:isdef(dis)?dis.index:null, username: Username };
	logClientSend('placePerle', data);
	Socket.emit('placePerle', data);
}
function sendRelayout(rows, cols, boardArr, poolArr) {
	//console.log('hallo sending relayout');
	let data = { rows: rows, cols: cols, boardArr: boardArr, username: Username };
	if (isdef(poolArr)) data.poolArr=poolArr;
	logClientSend('relayout', data);
	Socket.emit('relayout', data);
}

















