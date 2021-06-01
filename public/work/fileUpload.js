var urlNewImage;
var SZ_UPLOAD_CANVAS = 500;
var FilesToUpload = [];
var DataToUpload = null;

function clearPerlenEditor() { createPerlenEditor(); }
function togglePerlenEditor() {
	if (isdef(mBy('image-preview'))) closePerlenEditor(); else createPerlenEditor();
}
function closePerlenEditor() { clearElement(mBy('dLeiste')); }
function createPerlenEditor() {
	FilesToUpload = [];
	DataToUpload = null;
	let d = mBy('dLeiste');
	clearElement(d);
	// mStyleX(d,{w:SZ_UPLOAD_CANVAS+40});
	mButton('close', closePerlenEditor, mBy('dLeiste'), { w: '100%', h: 25 }, ['buttonClass']);
	mLinebreak(d, 10);
	let dropRegion = createDropBox(d);
	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = e => { e.preventDefault(); e.stopPropagation(); }
	dropRegion.ondrop = e => { e.preventDefault(); e.stopPropagation(); onDropImages(e); };

	var fakeInput = document.createElement("input"); //open file selector when clicked on the drop region
	fakeInput.type = "file";
	fakeInput.accept = "image/*";
	fakeInput.multiple = true;
	dropRegion.onclick = () => { fakeInput.click(); };
	fakeInput.onchange = () => { var files = fakeInput.files; previewFiles(files); };



}
function createDropBox(dParent) {
	let html = createElementFromHTML(
		`
	<div id="drop-region">
		<div class="drop-message">Drag & Drop images or click to upload</div>
		<div id="image-preview"></div>
	</div>
	`
	);
	mAppend(dParent, html);
	return html;
}

function crop500(img) {
	let sz = SZ_UPLOAD_CANVAS;
	let canvas = mBy('canvas1');
	let ctx = canvas.getContext("2d");
	let [cw, ch] = [canvas.width, canvas.height];
	let [padw, padh] = [(sz - cw) / 2, (sz - ch) / 2];

	let color = getBackgroundColor(img, ctx);
	ctx.clearRect(0, 0, sz, sz);
	drawColoredCircle(canvas, sz, color, color);
	ctx.drawImage(img, padw, padh, cw, ch);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.beginPath();
	ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2);
	ctx.closePath();
	//ctx.fillStyle = "#23ff94";
	ctx.fill();

}
function getBackgroundColor(img, ctx) {

	ctx.drawImage(img, 0, 0);
	var p = ctx.getImageData(1, 1, 1, 1).data;

	console.log('p', p)
	let rgb = `rgb(${p[0]},${p[1]},${p[2]})`;

	// var pos = findPos(this);	// var x = e.pageX - pos.x;	// var y = e.pageY - pos.y;//var c = this.getContext('2d');
	let x = 1, y = 1;
	var coord = "x=" + x + ", y=" + y;
	// var p = img.getImageData(x, y, 1, 1).data; 
	//var hex = anyColorToStandardString([p[0], p[1], p[2]]);
	let color = anyColorToStandardString(rgb);
	console.log('pixel', coord, 'has color', color);
	return color;
}

function onDropImages(e) {
	// let n = arrChildren(prev).length;
	// console.log('prev has', n, 'children');
	// if (n > 0) prev.lastChild.remove();

	var dt = e.dataTransfer;
	var files = dt.files;
	if (files.length) {
		previewFiles(files);
	} else {
		clearElement('image-preview');
		var html = dt.getData('text/html');
		let match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html);
		let url = match && match[1];
		if (url) { previewImageFromUrl(url); }
	}

}
function onClickUpload() {
	if (!isEmpty(FilesToUpload)) uploadFiles(); else uploadImage();
}

function previewFiles(files) {
	FilesToUpload = files;// FilesToUpload.concat(files);
	//console.log('FilesToUpload', files)
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])) {
			previewImageFromFile(files[i]);
		}
	}
	//console

	showUploadButton();
	showUpdateImagesCheckbox();
}
function previewImageFromUrl(url) {
	let prev = mBy('image-preview');
	var imgViewContainer = document.createElement("div");
	imgViewContainer.className = "image-view";
	prev.appendChild(imgViewContainer);

	var c = document.createElement("canvas"); c.id = 'canvas1';
	imgViewContainer.appendChild(c);
	var ctx = c.getContext("2d");

	var img = new Image;
	img.onload = function () {

		//ratio
		let [w, h] = [this.naturalWidth, this.naturalHeight];
		//groessere seite soll 500 sein, kleinere 
		let w1, h1, sx, sy;
		let diam = 500; let AUSSCHNEIDEN = true;
		if (AUSSCHNEIDEN) {
			if (w < h) { w1 = diam; h1 = diam * h / w; sx = 0; sy = (h - w) / 2; }
			else if (w > h) { h1 = diam; w1 = diam * w / h; sx = (w - h) / 2; sy = 0; }
			else { w1 = h1 = diam; sx = sy = 0; }
		} else {
			//extend 
			if (w > h) { w1 = diam; h1 = diam * h / w; }
			else if (w > h) { h1 = diam; w1 = diam * w / h; }
			else { w1 = h1 = diam; }
		}
		c.width = diam; //this.naturalWidth;   
		c.height = diam; //this.naturalHeight;

		ctx.drawImage(this, sx, sy, w - 2 * sx, h - 2 * sy, 0, 0, diam, diam);

		ctx.globalCompositeOperation = 'destination-in';
		ctx.beginPath();
		ctx.arc(diam / 2, diam / 2, diam / 2, 0, Math.PI * 2);
		ctx.closePath();
		//ctx.fillStyle = "#23ff94";
		ctx.fill();
		//crop500(this);
		showUploadInput();
		showUploadButton();
	};
	img.onerror = function () { alert("Error in uploading"); }
	img.crossOrigin = ""; // if from different origin, same as "anonymous"
	img.src = url;
}
function previewImageFromFile(imgFile) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	let prev = mBy('image-preview');
	prev.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
		imgFile.data = e.target.result; //img.toDataURL("image/png");
	}
	reader.readAsDataURL(imgFile);
}

function showUploadButton() {
	if (isdef(mBy('btnUpload'))) return;
	let btn = mButton('upload', onClickUpload, mBy('dLeiste'), { matop:5, w: 80, h: 25 }, ['buttonClass']);
	btn.id = 'btnUpload';

}
function showUpdateImagesCheckbox() {
	let id='chkUpdateImages';
	if (isdef(mBy(id))) return;

	let btn = mCheckbox('update images', false, mBy('dLeiste'),  { maleft: 12, mabottom: 0, hmin:25 },id);

}
function showUploadInput() {
	if (isdef(mBy('inputPerlenName'))) return;
	let inputPerlenName = mInput('Name:', '', mBy('dLeiste'), { matop: 10, align: 'left' }, 'inputPerlenName');
	mStyleX(inputPerlenName, { w: SZ_UPLOAD_CANVAS, border: 'none' });

}

function uploadImage() {
	//console.log('uploading image:', 'NI');
	try {
		let canvas = mBy('canvas1');
		let data = canvas.toDataURL("image/png");
		let filename = mBy('inputPerlenName').value;
		if (isEmpty(filename) || nundef(filename)) filename = 'aaa';
		console.log('filename', filename)
		// localStorage.setItem("saved-image-example", data); // canvas.toDataURL("image/png"));
		Socket.emit('image', { data: data, filename: filename });
		closePerlenEditor();
	}
	catch (err) {
		console.log("imageReceived Error: " + err);
	}
}
function uploadFiles() {
	//console.log('uploading files:', FilesToUpload);
	let updateImages=mBy('chkUpdateImages').checked;
	//console.log('updateImages',updateImages);
	//====?!!
	for (const imgFile of FilesToUpload) {
		//uploadFile00w(imgFile);
		//uploadFile01_NO(imgFile);
		//convertUrlToImageData
		// uploadFile02Works(imgFile); //:
		let data = imgFile.data;
		let filename = imgFile.name;

		//console.log('filename',filename);
		let perlenName = stringBefore(filename,'.');

		if (updateImages || !isdef(PerlenDict[perlenName])) Socket.emit('image', { data: data, filename: filename });
		else {
			//console.log('JUST ADD TO POOL!!!!',perlenName)
			Socket.emit('addToPool', { path: perlenName });
		}

	}
	closePerlenEditor();
	if (isdef(G)) G.setInitialPoolSelected();
}

function validateImage(image) {
	// check the type
	var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
	if (validTypes.indexOf(image.type) === -1) {
		alert("Invalid File Type");
		return false;
	}

	// check the size
	var maxSizeInBytes = 10e6; // 10MB
	if (image.size > maxSizeInBytes) {
		alert("File too large");
		return false;
	}

	return true;

}


//#region board upload
function createBoardEditor() {
	FilesToUpload = [];
	DataToUpload = null;
	let d = mBy('dLeiste');
	clearElement(d);
	// mStyleX(d,{w:SZ_UPLOAD_CANVAS+40});
	mButton('close', closePerlenEditor, mBy('dLeiste'), { w: '100%', h: 25 }, ['buttonClass']);
	mLinebreak(d, 10);
	let dropRegion = createDropBox(d);
	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = e => { e.preventDefault(); e.stopPropagation(); }
	dropRegion.ondrop = e => { e.preventDefault(); e.stopPropagation(); onDropBoardImage(e); };

	var fakeInput = document.createElement("input"); //open file selector when clicked on the drop region
	fakeInput.type = "file";
	fakeInput.accept = "image/*";
	fakeInput.multiple = true;
	dropRegion.onclick = () => { fakeInput.click(); };
	fakeInput.onchange = () => { var files = fakeInput.files; previewFiles(files); };
}
function onDropBoardImage(e) {
	var files = e.dataTransfer.files;
	if (files.length) {		previewBoardImage(files);	}
}
function onClickUploadBoard() {
	if (!isEmpty(FilesToUpload)) uploadBoard(); 
}
function previewBoardImage(files) {
	FilesToUpload = files;// FilesToUpload.concat(files);
	//console.log('FilesToUpload', files)
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])) {
			previewImageFromFile(files[i]);
		}
	}
	//console

	showBoardUploadButton();
	showUpdateImagesCheckbox();
}
function showBoardUploadButton() {
	if (isdef(mBy('btnUpload'))) return;
	let btn = mButton('upload', onClickUploadBoard, mBy('dLeiste'), { matop:5, w: 80, h: 25 }, ['buttonClass']);
	btn.id = 'btnUpload';

}
function uploadBoard() {
	//console.log('uploading files:', FilesToUpload);
	let updateImages=mBy('chkUpdateImages').checked;
	//console.log('updateImages',updateImages);
	//====?!!
	for (const imgFile of FilesToUpload) {
		//uploadFile00w(imgFile);
		//uploadFile01_NO(imgFile);
		//convertUrlToImageData
		// uploadFile02Works(imgFile); //:
		let data = imgFile.data;
		let filename = imgFile.name;

		//console.log('filename',filename);
		let boardName = stringBefore(filename,'.');

		if (updateImages || !isdef(PerlenDict[boardName])){
			Socket.emit('image', { data: data, filename: filename });
		} 
		else {
			//console.log('JUST ADD TO POOL!!!!',perlenName)
			Socket.emit('board', { path: boardName });
		}

	}
	closePerlenEditor();
}













