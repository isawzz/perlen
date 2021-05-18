function initGame(username, io) {
	if (io && isString(username)) { sendLogin(username); }//console.log('...', username) }
	else username = U.name;

	//hide('dHeader'); 
	hide('dMainContent');
	show('dGameScreen');
	setTitle('Glasperlenspiel');
	setSubtitle('logged in as ma');

	setNewBackgroundColor();
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();

	waitUntilPerlen();

}
function setNewBackgroundColor() {
	let bg = randomDarkColor();
	//bg = 'rgb(192,96,6)';
	BaseColor = bg; HeaderColor = colorDarker(BaseColor);
	setBackgroundColor(bg);
	mStyleX(dHeader, { bg: HeaderColor });
	mStyleX(dSubtitle, { fg: colorLighter(bg) });
}
function waitUntilPerlen() {
	if (nundef(Perlen)) { return TOMain = setTimeout(waitUntilPerlen, 200); }
	else {
		clearTimeout(TOMain)
		_start();
	}

}

