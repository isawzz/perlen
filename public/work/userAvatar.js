var Avatars = [];
var AvatarTimeout;
const SEND_MOUSE_MOVE_EVERY = 200;
const MOUSED = 15;
var LastPositionX = 0, LastPositionY = 0;
var MouseMoveCounter = 0;
window.onmousemove = sendMousePosition;

function makeUserAvatar(username) {
	let a = { username: username };
	let d = mDiv(document.body, { rounding:'50%', align: 'center', position: 'fixed', w: 30, h: 30, fz: 25, bg: 'random', fg: 'contrast' }, 'd' + username);
	d.innerHTML = username[0];
	Avatars[username] = d;
	return d;
}
function getAvatar(username) { let d = Avatars[username]; if (nundef(d)) d = makeUserAvatar(username); return d; }
function moveAvatar(username, x, y) { mStyleX(getAvatar(username), { left: x, top: y }); }
function showMouseAvatar(username) { show(getAvatar(username)); }
function hideMouseAvatar(username) { hide(getAvatar(username)); }

function handleMouse(data) { if (data.username == Username) return; moveAvatar(data.username, data.x, data.y); }
function handleShow(data) { if (data.username != Username) showMouseAvatar(data.username); }
function handleHide(data) { if (data.username != Username) hideMouseAvatar(data.username); }

function sendMousePosition(ev) {
	//console.log('username', Username, ev.pageX, ev.pageY)
	if (nundef(Socket)) return;
	if (!ev.altKey || ev.ctrlKey) return;
	let [x, y] = [ev.pageX, ev.pageY];
	//console.log('pos', x, y)
	if (Math.abs(x - LastPositionX) > MOUSED || Math.abs(y - LastPositionY) > MOUSED) {
		LastPositionX = x; LastPositionY = y;
		MouseMoveCounter = 0;
		Socket.emit('mouse', { username: Username, x: x, y: y });
	} else MouseMoveCounter += 1;
}

//function startAvatarTicker(){	AvatarTimeout = setInterval(sendMousePosition,1000);}

