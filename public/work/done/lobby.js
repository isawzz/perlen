const GENERATE_EMPTY_MESSAGES = true;

function onClickTempleLobby(){
	START_IN_MENU=true;
	initGameScreen();
}

function initLobby(username) {
	hide('dGameScreen'); hide('dButtons');
	show('dMainContent'); show('dLobby'); show('dHeader'); show('dTempleLobby');
	setTitle('Welcome to the Lobby');

	// show('navButton'); //TODO!!!
	// mBy('navButton').onclick = initGameScreen;
	// mBy('navButton').innerHTML = 'Play';



	//console.log('username',username)
	if (isString(username)) { sendLogin(username); console.log('...', username) }
	else username = U.name;

	sendBtn.onclick = e => {
		e.preventDefault();
		if (!messageInput.value) {
			if (GENERATE_EMPTY_MESSAGES) messageInput.value = 'hallo';
			else return console.log('must supply a message');
		}
		const message = { author: username, date: formatDate(new Date()), content: messageInput.value };
		console.log('sending message', message)
		sendUserMessage(message);
		messageInput.value = '';//clear input
	};

	//sendBtn.onclick = sendUserMessage('hallo hallo hallo');
}
function autoGameScreen(){
	
}
function initGameScreen() {

	console.log('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII!!!!!!!!!!')

	hide('dMainContent');hide('dHeader');show('dButtons');
	show('dGameScreen'); 

	// show('navButton'); setTitle('Glasperlenspiel');
	// mBy('navButton').onclick = () => {
	// 	if (isdef(G)) {			interrupt();		}
	// 	initLobby();
	// }
	// mBy('navButton').innerHTML = 'Lobby';

	
	console.log('game should be starting!!!');

	if (isdef(G)) {
		console.log('should just go back to game!');
		
	} else {
		_start();
	}
}
