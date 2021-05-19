function www(){
	console.log('dims',G.rows,G.cols,'\nboard',G.boardArr,'\npool',G.poolArr)
}
function simplestPerlenGame() {
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + Username);

	let color = USERNAME_SELECTION == 'local' ? localStorage.getItem('BaseColor') : null;
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

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
	G=new SimpleClass();
}
//skip next 2 steps!
function handleInitialPool(data) {	
	logClientReceive('initialPool', data);	
	G.initialPool(data.state.pool);}
function sendInitialPool(){}

function handleGameState(data) {
	logClientReceive('gameState', data);
	G.presentGameState(data);
}
function sendPlacePerle(perle,field){
	console.log('===> PLACE')
	let data = {iPerle:perle.index,iField:field.index,username:Username};
	logClientSend('placePerle',data);
	Socket.emit('placePerle',data);
}
function sendMovePerle(perle,field){
	console.log('hallo sending move')
	let data = {iPerle:perle.index,iField:field.index,username:Username};
	logClientSend('movePerle',data);
	Socket.emit('movePerle',data);
}
function sendRelayout(rows,cols,boardArr,poolArr){
	console.log('hallo sending relayout');www();
	let data = {rows:rows,cols:cols,boardArr:boardArr,poolArr:poolArr,username:Username};
	logClientSend('relayout',data);
	Socket.emit('relayout',data);
}

















