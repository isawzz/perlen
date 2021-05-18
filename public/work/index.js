
var dropRegion;// = document.getElementById("drop-region");// where files are dropped + file selector is opened
var imagePreviewRegion;// = document.getElementById("image-preview");	// where images are previewed
var fakeInput, inputPerlenName;
var SZ_UPLOAD_CANVAS = 200;

function closeLeiste() {
	//ev.stopPropagation();
	console.log('closing!');
	let d = mBy('dLeiste');
	//purge(d);
	clearElement(d);
	console.log(d);
	//clearElement(d);
	//d.style.display='none';

	setTimeout(() => mBy('sidebar').ondblclick = createPerlenEditor, 1000);
	//mBy('sidebar').onclick = openLeiste;
}
function createPerlenEditor() {
	let sz = SZ_UPLOAD_CANVAS;
	//show('dLeiste')
	let d = mBy('dLeiste');
	//clearElement(d);
	mText('drop image:', d, { w: sz, align: 'left' });
	imagePreviewRegion = mDiv(d, { w: sz, h: sz, bg: '#ffffff80' }, 'image-preview');
	fakeInput = document.createElement("input");
	fakeInput.type = "file";
	fakeInput.accept = "image/*";
	fakeInput.multiple = true;
	dropRegion = imagePreviewRegion;
	dropRegion.onclick = () => fakeInput.click();
	fakeInput.onchange = () => { var files = fakeInput.files; handleFiles(files); };
	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = preventDefault;
	dropRegion.ondrop = handleDrop;
	var canvas = mCreate('canvas');
	mAppend(imagePreviewRegion, canvas);
	canvas.id = 'canvas1';
	canvas.width = sz; canvas.height = sz;
	inputPerlenName = mInput('Name:', '', d, { matop: 10, align: 'left' }, 'inputPerlenName');
	mStyleX(inputPerlenName, { w: sz, border: 'none' });
	let dbuttons = mDiv(d);
	mButton('save', onClickSavePerle, dbuttons, { w: 80, h: 25 }, ['buttonClass']);
	mButton('clear', cancelNewPerle, dbuttons, { w: 80, h: 25, maleft: 12 }, ['buttonClass']);
	mButton('close', () => closeLeiste(), d, { position: 'absolute', w: 200, h: 25, bottom: 5 }, ['buttonClass']);
}
function cancelNewPerle() {
	// //hier muss man dann die neue perle zu dem pool dazugeben!
	// mBy('canvas1').getContext("2d").clearRect(0,0,SZ_UPLOAD_CANVAS,SZ_UPLOAD_CANVAS);
	// inputPerlenName.value='';
	// console.log('perle wird addiert',inputPerlenName.value);
	clearElement('dLeiste');
	createPerlenEditor();
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
	// console.log('canvas', cw, ch, 'img', iw, ih);
	let ctx = canvas.getContext("2d");

	let color = getBackgroundColor(img, ctx);
	ctx.clearRect(0, 0, sz, sz);

	drawColoredCircle(canvas, sz, color, color);
	ctx.drawImage(img, padw, padh, iw, ih);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.beginPath();
	ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();

}
function drawColoredCircle(canvas, sz, color, stroke = 'black') {
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var radius = sz / 2;
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
	// context.lineWidth = 5;
	// context.strokeStyle = stroke;
	// context.stroke();
}
function getBackgroundColor(img, ctx) {
	ctx.drawImage(img, 0, 0);
	var p = ctx.getImageData(1, 1, 1, 1).data;
	console.log('p', p)
	let rgb = `rgb(${p[0]},${p[1]},${p[2]})`;
	let color = anyColorToStandardString(rgb);
	return color;
}
function getCanvasPixelColor(c, x, y) {
	var coord = "x=" + x + ", y=" + y;
	var p = c.getImageData(x, y, 1, 1).data;
	var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
	console.log('pixel', coord, 'has color', hex);
}
function handleDrop(e) {
	e.preventDefault();
	e.stopPropagation();
	var dt = e.dataTransfer;
	var files = dt.files;

	if (files.length) { handleFiles(files); }
	else {
		var html = dt.getData('text/html');
		let match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html);
		let url = match && match[1];
		if (url) { uploadImageFromURL(url); return; }
	}

	function uploadImageFromURL(url) {
		var img = NEWLY_CREATED_IMAGE = new Image;
		var c = mBy('canvas1');
		img.onload = () => {
			cropImageCorrectly(img);


			// c.toBlob(function (blob) {        // get content as PNG blob

			// 	// call our main function
			// 	handleFiles([blob]);

			// }, "image/png");
		};
		img.onerror = function () { alert("Error in uploading"); }
		img.crossOrigin = "";              // if from different origin
		img.src = url; //"http://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png";

		// let clone = img.cloneNode();
		// let sz = 64;
		// let d = mDiv(dTable, { rounding: '50%', w: sz, h: sz, display: 'inline', bg: 'red', padding: 10 });
		// mAppend(d, clone);
		// mAppend(d,clone);

		let html = `
		<div style='display:inline;width:64px;height:64px;fz:12px;text-align:center;'>
		<div class="image-cropper img2">
			<img src="${url}" width=64 height=64 style='border-radius:50%' />
		</div>
		Mozart
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
	iAdd(perle,{div:elem});

		elem.onmouseenter = (ev) => { if (ev.ctrlKey) mMagnify(elem, 'mozart'); }
		elem.onmouseleave = () => mCancelMagnify();
		// add to dd pool!
		elem.onmousedown = (ev) => ddStart(ev, perle, false, true);
		mAppend(dTable, elem);
		// setTimeout(() => createPerle(perle, dTable, 64, 1.3, .4, true), 1000);
	
	}
}

function onClickSavePerle() {

	let name = inputPerlenName.value;
	let c = mBy('canvas1');
	if (!isEmpty(name)) {
		c.toBlob(function (blob) {

			// call our main function
			handleFiles([blob], name);

		}, "image/png");
	}

}

function handleFiles(files, name) {
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])) previewAnduploadImage(files[i], name);
	}
}
function makeTransparent(ctx) {
	var image = ctx.getImageData(0, 0, 100, 100);
	var imageData = image.data, length = imageData.length;
	// set every fourth value to 50
	for (var i = 3; i < length; i += 4) {
		imageData[i] = 50;
	}
	// after the manipulation, reset the data
	image.data = imageData;
	// and put the imagedata back to the canvas
	ctx.putImageData(image, 0, 0);
}
function makeGreyTransparent(ctx, color = 'white', sz = 200) {
	var image = ctx.getImageData(0, 0, sz, sz);
	var imageData = image.data, length = imageData.length;
	// set every fourth value to 50
	//r,g,b,a
	let im = imageData;
	const x = 245;
	for (var i = 0; i < length; i += 4) {
		if (im[i] > x && im[i + 1] > x && im[i + 2] > x) {
			//console.log(im[i],im[i+1],im[i+2]);
			im[i + 3] = 0;
		}
		//if (i>20) break;
	}
	// after the manipulation, reset the data
	image.data = imageData;
	// and put the imagedata back to the canvas
	ctx.putImageData(image, 0, 0);
}
function makeColorTransparent(ctx, color = 'white', sz = 100) {
	var image = ctx.getImageData(0, 0, sz, sz);
	var imageData = image.data, length = imageData.length;
	// set every fourth value to 50
	//r,g,b,a

	for (var i = 3; i < length; i += 4) {
		imageData[i] = 50;
	}
	// after the manipulation, reset the data
	image.data = imageData;
	// and put the imagedata back to the canvas
	ctx.putImageData(image, 0, 0);
}
function openLeiste() {
	//if (isdef(mBy('image-preview'))) return;
	show('dLeiste');
	createPerlenEditor();
}
function preventDefault(e) { e.preventDefault(); e.stopPropagation(); }
function previewAnduploadImage(image, name) {

	// // container
	// var imgView = document.createElement("div");
	// imgView.className = "image-view";
	// imagePreviewRegion.appendChild(imgView);

	// // previewing image
	// var img = document.createElement("img");
	// imgView.appendChild(img);

	// // progress overlay
	// var overlay = document.createElement("div");
	// overlay.className = "overlay";
	// imgView.appendChild(overlay);


	// read the image...
	var reader = new FileReader();
	reader.onload = function (e) {
		console.log('reading image', e.target);
		// img.src = e.target.result;
	}
	reader.readAsDataURL(image);

	// create FormData
	var formData = new FormData();
	//formData.append('tag','HALLOHALLO');
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

	saveFileAtClient("aaafilename.png", "data:image/png", image);
	return true;

}







//unused!
function addNewPerle() {
	//hier muss man dann die neue perle zu dem pool dazugeben!
	console.log('perle wird addiert', inputPerlenName.value);
}



