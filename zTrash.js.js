function simplestPerlenGame(username, io) {

	console.assert(isdef(U), 'User data not set!!!!!!!!!!!!!!!!')

	if (io && isString(username)) { sendLogin(username); }//console.log('...', username) }
	else username = U.name;

	//hide('dHeader'); 
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ' + username);

	let color = AUTOLOGIN? null:localStorage.getItem('BaseColor');
	setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

	if (!USESOCKETS) waitUntilPerlen();
	else { requestInitialPosition(Username); }

}
