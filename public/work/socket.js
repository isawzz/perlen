const messageTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login' };
const messages = []; // { author, date, content, type }

function initSocket() {
	Socket = io(SERVERURL);
	Socket.on('init', handleInit);
	Socket.on('db', handleDB)
	Socket.on('msg', handleMessage);
	Socket.on('userJoined', handleUserJoined);
	Socket.on('gameState', handleGameState);
}
//sending
function sendMsg(data) { sendProcess('msg', data); Socket.emit('msg', { data: data }); }
function sendLogin(msg) { sendProcess('login', msg); Socket.emit('login', { data: msg }); }
function sendFilename(msg) { sendProcess('filename', msg); Socket.emit('filename', { msg }); }

//receiving
function handleInit(data) {
	receiveProcess('init', data);
	//console.log('init from server:', data);
}
function handleUserJoined(data){
	//dieses msg soll haben: username und id, message
	//console.log('received userJoined data:',data);
	handleMessage(data.msg);


}
//this message arrives after sendLogin: got data, start chatting!
function handleDB(data) {
	receiveProcess('DB', data);
	DB = data.DB;
	U = data.userdata;
	//console.log('DB', DB, 'U', U)
}
function handleMessage(data) {
	//console.log('________________ received', data)
	if (isdef(data.data)) data=data.data;
	receiveProcess('msg', data);
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

function handleGameState(state) {
	state = JSON.parse(state); console.log(state);
	//presentState
}

//helpers: keeping track of messages!
var MessageCounter = 0;

function sendProcess(type, data) {
	MessageCounter++;
	//console.log('#' + MessageCounter, 'send', type, data)
}
function receiveProcess(type, data) {
	MessageCounter++;
	//console.log('#' + MessageCounter, 'receive', type, data)
}




