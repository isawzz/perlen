function initGame(username, io) {
	if (io && isString(username)) { sendLogin(username); console.log('...', username) }
	else username = U.name;

	//hide('dHeader'); 
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ma');
	setBackgroundColor(GREEN); mStyleX(document.body, { opacity: 1 });
	initTable(); initSidebar(); initAux(); initScore();
	mStyleX(dHeader, { bg: colorDarker(GREEN) });
	mStyleX(dSubtitle, { fg: colorLighter(GREEN) });

	_start();

}

