
function autoLogin(username) {	initSocket();	hide(dLogin);	initGame(username);}
function initLogin() {

	show(dLogin); hide(dLobby); hide(dGameScreen);
	loginBtn.addEventListener('click', e => {
		e.preventDefault();
		if (!usernameInput.value) { return console.log('Must supply a username'); }
		let username = usernameInput.value;
		
		username = username.toLowerCase();
		setUserData(username);
		
		localStorage.setItem('username',username);
		autoLogin(username);
	});
	document.body.style.opacity=1;
	//Username = prompt('Enter username:'); //could give it random  name or leave this out
}













