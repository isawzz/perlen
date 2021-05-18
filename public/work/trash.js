function createPerlenEditor() {

	let sz=SZ_UPLOAD_CANVAS;

	clearElement(dLeiste);
	mText('drop image:', dLeiste, { w: sz, align: 'left' });
	imagePreviewRegion = mDiv(dLeiste, { w: sz, h: sz, bg: '#ffffff80' }, 'image-preview');
	// mText('drop here!:', imagePreviewRegion, { matop: 50 });
	//imagePreviewRegion.innerHTML = 'drag image here'
	fakeInput = document.createElement("input");
	fakeInput.type = "file";
	fakeInput.accept = "image/*";
	fakeInput.multiple = true;

	dropRegion = imagePreviewRegion;
	dropRegion.onclick = ()=>fakeInput.click();
	fakeInput.onchange = ()=> { var files = fakeInput.files; handleFiles(files); };
	dropRegion.ondragenter = dropRegion.ondragleave = dropRegion.ondragover = preventDefault;
	dropRegion.ondrop = handleDrop;
	// dropRegion.addEventListener('click', function () { fakeInput.click(); });
	// fakeInput.addEventListener("change", function () { var files = fakeInput.files; handleFiles(files); });
	// dropRegion.addEventListener('dragenter', preventDefault, false)
	// dropRegion.addEventListener('dragleave', preventDefault, false)
	// dropRegion.addEventListener('dragover', preventDefault, false)
	// dropRegion.addEventListener('drop', preventDefault, false)
	// dropRegion.addEventListener('drop', handleDrop, false);


	var canvas = mCreate('canvas'); //document.getElementById("canvas");
	mAppend(imagePreviewRegion, canvas);
	canvas.id = 'canvas1';
	canvas.width = sz; canvas.height = sz; //canvas.style.background='#ffffff80';
	//mStyleX(canvas, { bg: '#ffffff80', matop: 10 });

	// var img = new Image();
	// img.onload = start;
	// img.src = "https://i.stack.imgur.com/oURrw.png";
	// function start() {
	// 	var cw, ch;
	// 	cw = canvas.width = img.width;
	// 	ch = canvas.height = img.height;
	// 	ctx.drawImage(img, 0, 0);
	// 	ctx.globalCompositeOperation = 'destination-in';
	// 	ctx.beginPath();
	// 	ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2);
	// 	ctx.closePath();
	// 	ctx.fill();
	// }
}




