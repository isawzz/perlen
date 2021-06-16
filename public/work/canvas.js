var IsCanvasActive = false;

function makeCanvas(d){
	let canvas = mCreate('canvas');
	mAppend(d,canvas);
	canvas.id='sheet';
	return canvas;

}

function onClickPaletteButton() {
	//if (HEROKU) { setNewBackgroundColor(); return; }
	//setNewBackgroundColor(); 
	alert('FUNCTION DISABLED!')
	return;

	IsCanvasActive = !IsCanvasActive;
	let canvas = mBy('sheet')

	if (IsCanvasActive) {
		// G.clientBoard.dOuter.style.zIndex = 1;
		// canvas.zIndex = 1006;
		canvas.style.userSelect = 'auto';
		console.log(G.clientBoard)
		let r = getRect(G.clientBoard.dOuter); r.left = r.x; r.top = r.y;
		console.log('rectBoard', r);
		// let d = mBy('dSheet');
		// show(d);
		// mStyleX(d, r);
		mStyleX(canvas,r);
		// canvas.width = 700;
		// canvas.height = 768;

		halloIchZeichneJetzt();

	} else {
		// hide('dSheet');
		// G.clientBoard.dOuter.style.zIndex = 1006;
		// canvas.zIndex = 0;
		canvas.style.userSelect = 'none';
		canvas.onmousedown = null;
		canvas.onmousemove = null;
		canvas.onmouseup = null;
	}



}

function halloIchZeichneJetzt() {

	/* Initialise variables */
	let isDrawing = false;
	let x = 0;
	let y = 0;

	/* Get canvas and context */
	const canvas = document.getElementById('sheet');
	// canvas.width = 1500;
	// canvas.height = 1000;
	let r = getRect(G.clientBoard.dOuter); r.left = r.x; r.top = r.y;
	console.log('rectBoard', r);
	canvas.width=r.w;
	canvas.height=r.h;
	var context = canvas.getContext('2d');

	/* Add the event listeners for mousedown, mousemove, and mouseup */
	canvas.onmousedown = e => {
		/* Drawing begins */
		x = e.offsetX;
		y = e.offsetY;
		isDrawing = true;
	};

	canvas.onmousemove = e => {
		/* Drawing continues */
		if (isDrawing === true) {
			drawLine(context, x, y, e.offsetX, e.offsetY);
			x = e.offsetX;
			y = e.offsetY;
		}
	};

	canvas.onmouseup = e => {
		/* Drawing ends */
		if (isDrawing === true) {
			drawLine(context, x, y, e.offsetX, e.offsetY);
			x = 0;
			y = 0;
			isDrawing = false;
		}
	};

	/* Initialise socket */
	var socket = io();

	/* Receiving Updates from server */
	socket.on('update_canvas', function (data) {
		let { x1, y1, x2, y2, color } = JSON.parse(data);
		drawLine(context, x1, y1, x2, y2, color, true);
	});

	/* Function to Draw line from (x1,y1) to (x2,y2) */
	function drawLine(context, x1, y1, x2, y2, color = selected_color, from_server = false) {

		/* Send updates to server (not re-emiting those received from server) */
		if (!from_server)
			socket.emit('update_canvas', JSON.stringify({ x1, y1, x2, y2, color }));

		/* Draw line with color, stroke etc.. */
		context.beginPath();
		context.strokeStyle = color;
		context.lineWidth = 5;
		context.lineCap = 'round'
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
		context.closePath();
	}

}

/* helper function to change selected_color
 triggered onclick buttons below canvas
 'red','green','blue'
*/
let selected_color = 'red';
function selectColor(color) {
	document.getElementsByClassName(selected_color)[0].classList.remove('selected');
	document.getElementsByClassName(color)[0].classList.add('selected');
	selected_color = color;
}







