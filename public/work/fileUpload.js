var urlNewImage;
var SZ_UPLOAD_CANVAS = 500;
var FilesToUpload = [];
var DataToUpload = null;

function clearPerlenEditor() { createPerlenEditor(); }
function togglePerlenEditor() {
	if (isdef(mBy('image-preview'))) closePerlenEditor(); else createPerlenEditor();
}
function closePerlenEditor() { clearElement(mBy('dLeiste')); }
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
function createPerlenEditor() {
	FilesToUpload = [];
	DataToUpload = null;
	let d = mBy('dLeiste');
	clearElement(d);
	// mStyleX(d,{w:SZ_UPLOAD_CANVAS+40});
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
function previewFiles(files) {
	FilesToUpload = files;// FilesToUpload.concat(files);
	console.log('FilesToUpload')
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])) {
			previewImageFromFile(files[i]);
		}
	}
	//console
	showUploadButton();
}
function showUploadButton() {
	if (isdef(mBy('btnUpload'))) return;
	let btn = mButton('upload', onClickUpload, mBy('dLeiste'), { w: 80, h: 25 }, ['buttonClass']);
	btn.id = 'btnUpload';
	//mButton('close', onClickUpload, mBy('dLeiste'), { w: 80, h: 25 }, ['buttonClass']);

}
function showUploadInput() {
	let inputPerlenName = mInput('Name:', '', mBy('dLeiste'), { matop: 10, align: 'left' }, 'inputPerlenName');
	mStyleX(inputPerlenName, { w: SZ_UPLOAD_CANVAS, border: 'none' });

}
function onClickUpload() {
	if (!isEmpty(FilesToUpload)) uploadFiles(); else uploadImage();
}
function uploadFiles() {
	console.log('uploading files:', FilesToUpload);
	for (const image of FilesToUpload) {
		console.log('image',image);
		var reader = new FileReader();
		reader.readAsDataURL(image);
		var formData = new FormData();
		formData.append('image', image);

		var uploadLocation = SERVERURL+'imageUpload'; // 'https://api.imgbb.com/1/upload';
		formData.append('key', 'bb63bee9d9846c8d5b7947bcdb4b3573');

		var ajax = new XMLHttpRequest();
		ajax.open("POST", uploadLocation, true);
		ajax.onreadystatechange = function (e) {
			if (ajax.readyState === 4) {
				if (ajax.status === 200) {
					console.log('uploaded', image.name)// done!
				} else {
					console.log('error', image.name)// done!
				}
			}
		}
		ajax.send(formData);

	}

}
function addPerleToGame(url, name) {

	// let clone = img.cloneNode();		// let sz = 64;		// let d = mDiv(dTable, { rounding: '50%', w: sz, h: sz, display: 'inline', bg: 'red', padding: 10 });		// mAppend(d,clone);

	let html = `
		<div style='display:inline;width:64px;height:93px;font-size:10px;text-align:center;'>
			<div class="image-cropper img2">
				<img src="${urlNewImage}" width=64 height=64 style='border-radius:50%' />
			</div>
			${name}
		</div>
		`;

	let elem = createElementFromHTML(html);
	let perle = {
		Name: name,
		path: name,
		Update: formatDate(),
		Created: formatDate(),
		"Fe Tags": '',
		"Wala Tags": '',
		"Ma Tags": ''
	};
	Perlen.push(perle);

	perle.type = 'perle'; elem.id = iRegister(perle);
	iAdd(perle, { div: elem });

	elem.onmouseenter = ev => onEnterPerle(perle, ev); // (ev) => { if (ev.ctrlKey) mMagnify(x, item); }
	elem.onmouseleave = ev => onExitPerle(perle, ev); //() => mCancelMagnify(x, item.path);

	// elem.onmouseenter = (ev) => { if (ev.ctrlKey) mMagnify(elem, perle); }
	// elem.onmouseleave = () => mCancelMagnify();
	// add to dd pool!
	elem.onmousedown = (ev) => ddStart(ev, perle, false, true);
	mAppend(dTable, elem);
	// setTimeout(() => createPerle(perle, dTable, 64, 1.3, .4, true), 1000);



}

function uploadImage() {
	console.log('uploading image:', 'NI');
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

		crop500(this);
		showUploadInput();
		showUploadButton();
	};
	img.onerror = function () { alert("Error in uploading"); }
	img.crossOrigin = ""; // if from different origin, same as "anonymous"
	img.src = url;
}
function previewImageFromFile(imageFile) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	let prev = mBy('image-preview');
	prev.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	var reader = new FileReader();
	reader.onload = function (e) { img.src = e.target.result; }
	reader.readAsDataURL(imageFile);
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

















function uploadImageFromURL(url) {
	var img = new Image;
	var c = document.createElement("canvas");
	var ctx = c.getContext("2d");

	img.onload = function () {
		c.width = this.naturalWidth;     // update canvas size to match image
		c.height = this.naturalHeight;
		ctx.drawImage(this, 0, 0);       // draw in image
		c.toBlob(function (blob) {        // get content as PNG blob

			// call our main function
			handleFiles([blob]);

		}, "image/png");
	};
	img.onerror = function () { alert("Error in uploading"); }
	img.crossOrigin = "";              // if from different origin
	img.src = url;
}
function cropImageCorrectly(img) {
	let sz = SZ_UPLOAD_CANVAS;
	let canvas = mBy('canvas1');
	let cw, ch, iw, ih, fw, fh, f, padw, padh, padmin = sz * .1;
	cw = ch = sz; //canvas.width = 200;// img.width;	ch = canvas.height = 200; //img.height;
	iw = img.naturalWidth;     // update canvas size to match image
	ih = img.naturalHeight;
	fw = cw / iw;
	fh = ch / ih;
	f = Math.min(fw, fh);
	iw *= f;
	ih *= f;
	padw = (cw - iw) / 2;
	padh = (ch - ih) / 2;

	let dx, dy, cwNet, chNet;
	if (padw < padmin && padh < padmin) {
		padw = padh = padmin;
		cwNet = cw - 2 * padmin;
		chNet = ch - 2 * padmin;
		iw = img.naturalWidth;     // update canvas size to match image
		ih = img.naturalHeight;
		fw = cwNet / iw;
		fh = chNet / ih;
		f = Math.min(fw, fh);
		iw *= f;
		ih *= f;

	}


	console.log('canvas', cw, ch, 'img', iw, ih);
	let ctx = canvas.getContext("2d");

	let color = getBackgroundColor(img, ctx);
	ctx.clearRect(0, 0, sz, sz);

	drawColoredCircle(canvas, sz, color, color);


	ctx.drawImage(img, padw, padh, iw, ih);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.beginPath();
	ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2);
	ctx.closePath();
	//ctx.fillStyle = "#23ff94";
	ctx.fill();

}
function previewAnduploadImage(image) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	let imagePreviewRegion = mBy('image-preview');
	imagePreviewRegion.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	// progress overlay
	var overlay = document.createElement("div"); overlay.className = "overlay"; imgView.appendChild(overlay);

	// read the image...
	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
	}
	reader.readAsDataURL(image);

	//return;
	// create FormData
	var formData = new FormData();
	formData.append('image', image);

	// upload the image
	var uploadLocation = '/imageUpload';//http:/localhost:3333';// 'https://api.imgbb.com/1/upload';
	formData.append('key', 'bb63bee9d9846c8d5b7947bcdb4b3573');

	var ajax = new XMLHttpRequest();
	ajax.open("POST", uploadLocation, true);

	ajax.onreadystatechange = function (e) {
		if (ajax.readyState === 4) {
			if (ajax.status === 200) {
				// done!
			} else {
				// error!
			}
		}
	}

	ajax.upload.onprogress = function (e) {
		var perc = (e.loaded / e.total * 100) || 100, width = 100 - perc;
		overlay.style.width = width;
	}
	console.log('sending formData', formData)
	ajax.send(formData);
}
function previewImageFromUrl2(url) {
	//usage: loadImage(imageUrl);
	//url = "https://mdn.mozillademos.org/files/16797/clock-demo-400px.png";
	// const container = document.querySelector(".container");
	var imgViewContainer = document.createElement("div");
	imgViewContainer.className = "image-view";
	let prev = mBy('image-preview');
	prev.appendChild(imgViewContainer);
	let container = prev;

	const image = new Image(200, 200);
	image.addEventListener("load",
		() => container.prepend(image)
	);

	image.addEventListener("error", () => {
		const errMsg = document.createElement("output");
		errMsg.value = `Error loading image at ${url}`;
		container.append(errMsg);
	});

	image.crossOrigin = "";//use-credentials"; //"anonymous";
	image.alt = "";
	image.src = url;
}
