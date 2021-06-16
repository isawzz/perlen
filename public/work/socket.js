//#region prelim
const messageTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login' };
const messages = []; // { author, date, content, type }
const VerboseSocket = false;

class FakeSocketClass{
	constructor(){
		if (VerboseSocket) console.log('FAKE SOCKET!!!');
	}
	emit(){if (VerboseSocket) console.log('client emits',...arguments);}
}
function initSocket() {

	//if (!USESOCKETS) {Socket=new FakeSocketClass();return;}
	//console.log('init socket!!!')
	Socket = io(SERVERURL);
	Socket.on('clientId', handleClientIdSendLogin);
	Socket.on('db', handleDB);
	Socket.on('userJoined', handleUserJoined);
	Socket.on('userLeft', handleUserLeft);
	Socket.on('userMessage', handleUserMessage);

	Socket.on('gameState', handleGameState);
	Socket.on('dbUpdate',handleDbUpdate);

	Socket.on('mouse', handleMouse);
	Socket.on('show', handleShow);
	Socket.on('hide', handleHide);

	//debugging:
	//Socket.on('lastState', handleLastState);

	//Socket.on('initialPool', handleInitialPool); //skip for now!


	// Socket.on('gameOver', handleGameOver);
	// Socket.on('gameCode', handleGameCode);
	// Socket.on('unknownCode', handleUnknownCode);
	// Socket.on('tooManyPlayers', handleTooManyPlayers);
}

//#region done!
function handleUserJoined(data) {
	logClientReceive('userJoined', data.username)
}
function handleUserLeft(data) {
	logClientReceive('userLeft', data.id)
}
function handleUserMessage(data) {
	logClientReceive('userMessage', data.username);
}

//sending
function sendLogin(username) { logClientSend('login', username); Socket.emit('login', { data: username }); }
function sendUserMessage(data) { logClientSend('userMessage', data.username); Socket.emit('userMessage', { data: data }); }

//DEPRECATED:
function sendReset(settings) { logClientSend('reset', Username); Socket.emit('reset', { settings: settings, username: Username }); }
function sendFilename(msg) { logClientSend('filename', msg); Socket.emit('filename', { msg }); }
function sendSettings(){
	logClientSend('settings', G.settings);
	console.assert(G.settings == Settings.o,"wrong settings object!!!!!!!")
	Socket.emit('settings',{settings:G.settings,nFields:calcNFields(G.settings)});
}
function sendSettingsWithBoardImage(pack){
	logClientSend('sendSettingsWithBoardImage', pack.filename);
	
	console.log('pack',pack);
	Socket.emit('settingsWithBoardImage', pack);
}


//helpers: keeping track of messages!
function logClientSend(type, data) {
	MessageCounter++;
	if (VerboseSocket) console.log('#' + MessageCounter, 'send', type, data)
}
function logClientReceive(type, data) {
	MessageCounter++;
	if (VerboseSocket) console.log('#' + MessageCounter, 'receive', type, data)
}
//#endregion


//#region old stuff!-----------------------------
//receiving
function handleInitialPosition(data) {
	console.log('initial position:', data);
}
//this message arrives after sendLogin: got data, start chatting!
function handleMessage(data) {
	//console.log('________________ received', data)
	if (isdef(data.data)) data = data.data;
	logClientReceive('userMessage', data);
	//data=JSON.parse(data);
	//console.log('msg from server:', data);
	//console.log('===>received message', data.author, U.username)
	//if (data.type !== messageTypes.LOGIN) {

	if (isString(data)) {
		data.type = messageTypes.LEFT;

	} else if (data.author === U.username) {
		data.type = messageTypes.RIGHT;
	} else {
		data.type = messageTypes.LEFT;
	}
	//}

	messages.push(data);
	displayMessages();
	let chatWindow = mBy('dLobby')
	chatWindow.scrollTop = chatWindow.scrollHeight;//scroll to the bottom
}


const createMessageHTML = message => {
	if (isString(message)) {
		return `
			<p class="secondary-text text-center mb-2">${message}</p>
		`;
	} else if (isString(message)) {
		return `
		<div>
			<p style="color:red" class="message-content">${message}</p>
		</div>
		`;
	}
	return `
	<div class="message ${message.type === messageTypes.LEFT ? 'message-left' : 'message-right'
		}">
		<div class="message-details flex">
			<p class="flex-grow-1 message-author">${message.author}</p>
			<p class="message-date">${message.date}</p>
		</div>
		<p class="message-content">${message.content}</p>
	</div>
	`;
};

const displayMessages = () => {
	const messagesHTML = messages
		.map(message => createMessageHTML(message))
		.join('');
	messagesList.innerHTML = messagesHTML;
};




function handleGameOver(data) {
	if (!gameActive) {
		return;
	}
	data = JSON.parse(data);

	gameActive = false;

	if (data.winner === playerNumber) {
		alert('You Win!');
	} else {
		alert('You Lose :(');
	}
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
	reset();
	alert('Unknown Game Code')
}

function handleTooManyPlayers() {
	reset();
	alert('This game is already in progress');
}
//#endregion


