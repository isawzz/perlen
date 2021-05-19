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
	let data = Username;
	logClientSend('startOrJoinPerlen', data); 
	Socket.emit('startOrJoinPerlen', data); 
}

