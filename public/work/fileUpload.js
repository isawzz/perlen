var urlNewImage;
var SZ_UPLOAD_CANVAS = 200;

function closePerlenEditor() { clearElement(mBy('dLeiste')); }
function clearPerlenEditor() {
	clearElement(mBy('dLeiste'));
	createPerlenEditor();
}
function createPerlenEditor() {
	let sz = SZ_UPLOAD_CANVAS;
	let d = mBy('dLeiste');
	mText('drop image:', d, { w: sz, align: 'left' });

	let dropRegion = mDiv(d, { w: sz, h: sz, bg: '#ffffff80' }, 'image-preview');

	//for local files!
	// let fakeInput = document.createElement("input");
	// fakeInput.type = "file";
	// fakeInput.accept = "image/*";
	// fakeInput.multiple = false;
	// fakeInput.onchange = () => { var files = fakeInput.files; handleFiles(files); };
	// dropRegion.onclick = () => fakeInput.click();

	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = e => { e.preventDefault(); e.stopPropagation(); }
	dropRegion.ondrop = handleDrop;

	var canvas = mCreate('canvas'); mAppend(dropRegion, canvas);
	canvas.id = 'canvas1'; canvas.width = sz; canvas.height = sz;

	let inputPerlenName = mInput('Name:', '', d, { matop: 10, align: 'left' }, 'inputPerlenName');
	mStyleX(inputPerlenName, { w: sz, border: 'none' });

	let dbuttons = mDiv(d);
	mButton('save', onClickSavePerle, dbuttons, { w: 80, h: 25 }, ['buttonClass']);
	mButton('clear', cancelNewPerle, dbuttons, { w: 80, h: 25, maleft: 12 }, ['buttonClass']);
	mButton('close', () => closePerlenEditor(), d, { position: 'absolute', w: 200, h: 25, bottom: 5 }, ['buttonClass']);
}
function handleDrop(e) {
	mBy('canvas1').getContext('2d').clearRect(0, 0, SZ_UPLOAD_CANVAS, SZ_UPLOAD_CANVAS);
	e.preventDefault();
	e.stopPropagation();
	var dt = e.dataTransfer;
	var html = dt.getData('text/html');
	let match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html);
	let url = match && match[1];
	// console.log('html', html, '\nmatch', match, '\nurl', url);
	if (url) { startImageDownload(url); return; }
}
function startImageDownload(imageUrl) {
	//let imageURL = "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189";

	let downloadedImg = new Image;
	downloadedImg.crossOrigin = "Anonymous";
	downloadedImg.addEventListener("load", () => imageLoadCompleted(downloadedImg), false);
	downloadedImg.src = imageUrl;
}
function imageLoadCompleted(downloadedImg) {
	let canvas = mBy('canvas1');
	let context = canvas.getContext("2d");

	let prev = mBy('image-preview');
	canvas.width = downloadedImg.width;
	canvas.height = downloadedImg.height;
	mStyleX(prev, { w: canvas.width, h: canvas.height });

	context.drawImage(downloadedImg, 0, 0);
	//imageBox.appendChild(canvas);
}
function onClickSavePerle() {
	try {
		let canvas = mBy('canvas1');
		let data = canvas.toDataURL("image/png");
		let filename = mBy('inputPerlenName').value;
		if (isEmpty(filename) || nundef(filename)) filename = 'aaa';
		console.log('filename', filename)
		localStorage.setItem("saved-image-example", data); // canvas.toDataURL("image/png"));
		Socket.emit('image', { data: data, filename: filename });
		clearPerlenEditor();		
	}
	catch (err) {
		console.log("imageReceived Error: " + err);
	}
}



