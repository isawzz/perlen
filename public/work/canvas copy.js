class BlankSheet {
	constructor(io, canvasElem) {

		console.log('hallo')
		let canvas = this.canvas = isdef(canvasElem) ? canvasElem
			: document.getElementById('sheet');
		this.context = canvas.getContext('2d');
		this.isDrawing = false;
		this.x = 0;
		this.y = 0;

		canvas.addEventListener('mousedown', e => {
			/* Drawing begins */



			console.log('haaaaaaaaaaaaaaaaaaaaaaaaa');
			this.x = e.offsetX;
			this.y = e.offsetY;
			this.isDrawing = true;
		});

		canvas.addEventListener('mousemove', e => {
			/* Drawing continues */
			if (this.isDrawing === true) {
				drawLine(this.context, this.x, this.y, e.offsetX, e.offsetY);
				this.x = e.offsetX;
				this.y = e.offsetY;
			}
		});

		window.addEventListener('mouseup', e => {
			/* Drawing ends */
			if (this.isDrawing === true) {
				drawLine(this.context, this.x, this.y, e.offsetX, e.offsetY);
				this.x = 0;
				this.y = 0;
				this.isDrawing = false;
			}
		});

		this.socket = io;

		this.socket.on('update_canvas', function (data) {
			let { x1, y1, x2, y2, color } = JSON.parse(data);
			drawLine(this.context, x1, y1, x2, y2, color, true);
		});
	}
}

function openCanvas() {
	show('sheet');
}
/* Function to Draw line from (x1,y1) to (x2,y2) */
function drawLine(context, x1, y1, x2, y2, color = 'red', from_server = false) {

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

