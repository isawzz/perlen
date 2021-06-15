onload = UITEST?startTesting:start; // start | startTesting | startClientTest

async function start() {

	//boardTestGetCol(); return; //boardTestGetRow();	return;

	//body is initially hidden!!!
	loadAssets('./assets/'); 
	//await loadAssets('./assets/'); //use this when starting in game!

	//determining user name
	let username;
	switch (USERNAME_SELECTION) {
		case 'random': username = chooseRandom(['ma', 'wala', 'felix', 'nil', 'gul']); break;
		case 'local': username = localStorage.getItem('username'); break;
		default: username = USERNAME_SELECTION; break;
	}
	//in case have no username, need to open login!
	if (nundef(username)) { openLogin(); } else { establishUsername(username); }

}
function openLogin() {
	show(dLogin); hide(dLobby); hide(dGameScreen);
	loginBtn.onclick = e => {
		e.preventDefault();
		if (!usernameInput.value) { return console.log('Must supply a username'); }
		let username = usernameInput.value;

		username = username.toLowerCase();

		localStorage.setItem('username', username);
		establishUsername(username);
	};
	document.body.style.opacity = 1;
	//Username = prompt('Enter username:'); //could give it random  name or leave this out
}
function establishUsername(username) {
	hide(dLogin);
	Username = username;
	initSocket();
	//if (USESOCKETS) { initSocket(); } else { fakeInitSocket(username); }
}
//1. server sends client id => client sends login/username
function fakeInitSocket() { ClientId = '12345'; fakeLogin(Username);  }
function handleClientIdSendLogin(data) {
	//console.log('handleClientId data received:',data);
	ClientId = data.clientId;
	sendLogin(Username);
}

//2. server sends DB => client sets DB
async function fakeLogin(username) {
	DB = await route_path_yaml_dict('./data.yaml');
	PerlenDict = await route_path_yaml_dict('./perlenDict.yaml');
	//console.log('db loaded...')
	initSocket();
	setUserData(username);
	//console.log('userdata set! ...entering lobby')
	enterLobby();
}
function handleDB(data) {
	//console.log('handleDB data received:',data);
	DB = data.DB;
	setUserData(Username);
	enterLobby();
}
function setUserData(username) {
	if (nundef(DB.users[username])) {
		U = DB.users[username] = jsCopy(DB.users.guest0);
		U.id = U.name = U.username = Username = username;
		//neuen user anlegen?nein!
	} else {
		U = DB.users[username]; U.name = U.username = Username = U.id;
	}
	U.clientId = ClientId;
}
//default ist: wenn mal drin bin kann alles anschauen in lobby gehen
//eine neue table createn, eine table joinen, ...
//at this point, got logged in, can proceed to lobby or to game?
//3. enter lobby
function enterLobby() {
	console.assert(isdef(DB) && isdef(U), 'ENTERLOBBY DB U NOT CORRECT!!!')
	if (JUST_PERLEN_GAME) { simplestPerlenGame(); }
}

//=>von da geht es zu game (simplestPerlenGame.js mit simpleClass...)