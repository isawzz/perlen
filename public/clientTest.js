async function startClientTest() {
	// await loadAssets('./assets/'); //use this when starting in game!
	// DB = await route_path_yaml_dict('./data.yaml');

	hide('dMainContent');
	show('dGameScreen');
	setTitle('*** Testing ***');
	setSubtitle('logged in as ' + Username);

	//let color = USERNAME_SELECTION == 'local' ? localStorage.getItem('BaseColor') : null;
	//setNewBackgroundColor(color);
	mStyleX(document.body, { opacity: 1 });
	initTable(null, 2); initSidebar(); initAux(); initScore();
	runClientTest();
}
function runClientTest() {

	imageFileTests(); //hexBoardTests();
}
//#region test image file transfer via socket
function imageFileTests() {
	initTable(); Items = {};

	//initSocket fuer tests:
	Socket = io(SERVERURL);

	let item = mFileInput(dTable);
	mLinebreak(dTable, 25);
	//(caption, handler, dParent, styles, classes)
	let btn = mButton('upload', () => mSocketUploadImage(item, Socket), dTable);



}
function mSocketUploadImage(item, socket) {
	if (!item.loaded) {
		console.log('file not ready!click again!'); return;
	}
	socket.emit('testImageUpload', { filename: item.filename, image: item.base64 });



}
function mFileInput(dParent, dPreviewParent) {
	let dInput = mDiv(dParent, { padding: 4, h: 100, bg: '#fff', align: 'center', cursor: 'pointer', fg: 'gray' });
	let dMessage = mDiv(dInput, {}, null, 'click to browse');
	let dPreview = mDiv(dInput);
	var fakeInput = document.createElement("input"); //open file selector when clicked on the drop region
	fakeInput.type = "file";
	fakeInput.accept = "image/*";
	fakeInput.multiple = false;
	dInput.onclick = () => { fakeInput.click(); };
	let item = { fileObject: null, filename: null, imgData: null, img: null, loaded: false };
	iAdd(item, { div: dInput, dPreview: dPreview });
	var img = mCreate("img"); mAppend(dPreview, img);
	mStyleX(img, { wmax: 100, hmax: 70, mabottom: 4 })

	fakeInput.onchange =  function() {

		const reader = new FileReader();
		reader.onload = function() {
			img.src=this.result;
			const base64 = this.result.replace(/.*base64,/, '');
			Socket.emit('image2', base64);
		};
		reader.readAsDataURL(this.files[0]);
	
	};
	// fakeInput.onchange = () => {
	// 	let file = item.fileObject = fakeInput.files[0];
	// 	mFilePreview(item, isdef(dPreviewParent) ? dPreviewParent : dPreview, false);
	// };
	return item;
}
function mFilePreview(item, dParent, allowMultipleChildren = true) {
	let imgFile = item.fileObject;

	if (!allowMultipleChildren) clearElement(dParent);
	//var imgView = mDiv(dParent);
	var img = mCreate("img"); mAppend(dParent, img);
	mStyleX(img, { wmax: 100, hmax: 70, mabottom: 4 })
	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
		//let data = item.data = imgFile.data = e.target.result;
		//item.base64 = data.replace(/.*base64,/, '');

		let bytes = item.bytes = new Uint8Array(e.target.result);
		Socket.emit('image1', bytes);


		item.filenameWithExt = imgFile.name;
		item.filename = stringBefore(imgFile.name, '.');
		item.ext = stringAfter(imgFile.name, '.');
		item.img = img;
		item.previewParent = dParent;
		item.loaded = true;
		console.log('item', item);
	}
	reader.readAsArrayBuffer(imgFile);
	//reader.readAsDataURL(imgFile);
}



