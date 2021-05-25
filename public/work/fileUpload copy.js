var urlNewImage;
var SZ_UPLOAD_CANVAS = 200;

function closePerlenEditor() { clearElement(mBy('dLeiste')); }
function clearPerlenEditor() { createPerlenEditor(); }
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
	let sz = SZ_UPLOAD_CANVAS;
	let d = mBy('table');
	clearElement(d);

	// mText('drop image:', d, { w: sz, align: 'left' });
	// let dropRegion = mDiv(d, { w: sz, h: sz, bg: '#ffffff80' }, 'image-preview');

	let dropRegion = createDropBox(d);
	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = e => { e.preventDefault(); e.stopPropagation(); }
	dropRegion.ondrop = onDropImages;

	var canvas = mCreate('canvas'); mAppend(dropRegion, canvas);
	canvas.id = 'canvas1'; canvas.width = sz; canvas.height = sz;

	let inputPerlenName = mInput('Name:', '', d, { matop: 10, align: 'left' }, 'inputPerlenName');
	mStyleX(inputPerlenName, { w: sz, border: 'none' });

	let dbuttons = mDiv(d);
	mButton('save', onClickSavePerle, dbuttons, { w: 80, h: 25 }, ['buttonClass']);
	mButton('clear', clearPerlenEditor, dbuttons, { w: 80, h: 25, maleft: 12 }, ['buttonClass']);
	mButton('close', () => closePerlenEditor(), d, { position: 'absolute', w: 200, h: 25, bottom: 5 }, ['buttonClass']);


	//for local files!
	// let fakeInput = document.createElement("input");
	// fakeInput.type = "file";
	// fakeInput.accept = "image/*";
	// fakeInput.multiple = true;
	// fakeInput.onchange = () => { var files = fakeInput.files; handleFiles(files); };
	// dropRegion.onclick = () => fakeInput.click();

	// mButton('upload files', () => onClickFakeInput(fakeInput), dd, { w: 80, h: 25 }, ['buttonClass']);

}
function onDropImages(e) {
	mBy('canvas1').getContext('2d').clearRect(0, 0, SZ_UPLOAD_CANVAS, SZ_UPLOAD_CANVAS);
	e.preventDefault();
	e.stopPropagation();
	var dt = e.dataTransfer;
	var files = dt.files;
	console.log('dt', dt)
	console.log('files', files)

	if (files.length) {
		for (var i = 0, len = files.length; i < len; i++) {
			if (validateImage(files[i])) previewAnduploadImage(files[i], name);
		}
	} else {
		var html = dt.getData('text/html');
		let match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html);
		let url = match && match[1];
		// console.log('html', html, '\nmatch', match, '\nurl', url);
		if (url) { 
			startImageDownload(url); 
			return; 
		}
	}
}
function startImageDownload(imageUrl) {
	//let imageURL = "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189";
	let downloadedImg = new Image;
	downloadedImg.crossOrigin = "Anonymous";
	downloadedImg.addEventListener("load", () => previewOnCanvas(downloadedImg), false);
	downloadedImg.src = imageUrl;
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

function previewOnCanvas(downloadedImg) {
	let canvas = mBy('canvas1');
	let context = canvas.getContext("2d");

	let prev = mBy('image-preview');
	canvas.width = downloadedImg.width;
	canvas.height = downloadedImg.height;
	mStyleX(prev, { w: canvas.width, h: canvas.height });

	context.drawImage(downloadedImg, 0, 0);
	//imageBox.appendChild(canvas);
}

function previewImage(image, name) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	let prev = mBy('image-preview');
	prev.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	// progress overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	imgView.appendChild(overlay);


	return;
	// read the image...
	var reader = new FileReader();
	reader.onload = function (e) {
		console.log('reading image', e.target);
		// img.src = e.target.result;
	}
	reader.readAsDataURL(image);

	// create FormData
	var formData = new FormData();
	formData.append('image', image);

	// upload the image
	var uploadLocation = SERVERURL + '/imageUpload'; // 'https://api.imgbb.com/1/upload';
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

		// change progress
		// (reduce the width of overlay)

		var perc = (e.loaded / e.total * 100) || 100,
			width = 100 - perc;

		//overlay.style.width = width;
	}

	sendFilename(name);
	ajax.send(formData);

	return;
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
	setTimeout(() => createPerle(perle, dTable, 64, 1.3, .4, true), 1000);
}

function previewAnduploadImage(image, name) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	let prev = mBy('image-preview');
	prev.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	// progress overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	imgView.appendChild(overlay);


	return;
	// read the image...
	var reader = new FileReader();
	reader.onload = function (e) {
		console.log('reading image', e.target);
		// img.src = e.target.result;
	}
	reader.readAsDataURL(image);

	// create FormData
	var formData = new FormData();
	formData.append('image', image);

	// upload the image
	var uploadLocation = SERVERURL + '/imageUpload'; // 'https://api.imgbb.com/1/upload';
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

		// change progress
		// (reduce the width of overlay)

		var perc = (e.loaded / e.total * 100) || 100,
			width = 100 - perc;

		//overlay.style.width = width;
	}

	sendFilename(name);
	ajax.send(formData);

	return;
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
	setTimeout(() => createPerle(perle, dTable, 64, 1.3, .4, true), 1000);
}

// function validateImage(image) {
// 	// check the type
// 	var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
// 	if (validTypes.indexOf(image.type) === -1) {
// 		alert("Invalid File Type");
// 		return false;
// 	}

// 	// check the size
// 	var maxSizeInBytes = 10e6; // 10MB
// 	if (image.size > maxSizeInBytes) {
// 		alert("File too large");
// 		return false;
// 	}

// 	saveFileAtClient("aaafilename.png", "data:image/png", image);
// 	return true;

// }

