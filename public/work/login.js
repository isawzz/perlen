function autoLogin(username) {
	Username=username;
	dSubtitle.innerHTML='logged in as '+username;
	initSocket();
	hide(dLogin);
	initLobby(username);
}
function initLogin() {
	show(dLogin); hide(dLobby); hide(dGameScreen);
	loginBtn.addEventListener('click', e => {
		e.preventDefault();
		if (!usernameInput.value) { return console.log('Must supply a username'); }
		let username = usernameInput.value;
		console.log('username',username)
		autoLogin(username);
	});
	//Username = prompt('Enter username:'); //could give it random  name or leave this out
}












